document.addEventListener('DOMContentLoaded', function() {
  const clearLogsButton = document.getElementById('clearLogs');
  const requestTableBody = document.getElementById('requestTableBody');
  const highlightFormsButton = document.getElementById('highlightForms');

  // Fetch and display the logged POST requests
  chrome.storage.local.get('postRequests', function(data) {
    const requests = data.postRequests || [];
    requests.forEach(request => {
      const row = document.createElement('tr');
      row.className = "toggle-details";
      row.innerHTML = `
        <td>${request.id}</td>
        <td>${request.method}</td>
        <td>${request.url}</td>
        <td><button class="send-to-backend" data-id="${request.id}">Send to Backend</button></td>
      `;

      const detailsRow = document.createElement('tr');
      detailsRow.classList.add('details');
      detailsRow.innerHTML = `
        <td colspan="4">
          <div class="raw-request">
${request.method} ${new URL(request.url).pathname} HTTP/1.1
Host: ${new URL(request.url).host}
${request.headers}

${request.rawRequest}
          </div>
        </td>
      `;

      row.addEventListener('click', function(event) {
        event.preventDefault();
        detailsRow.classList.toggle('details');
      });

      requestTableBody.appendChild(row);
      requestTableBody.appendChild(detailsRow);
    });

    // Add event listener for all send-to-backend buttons
    document.querySelectorAll('.send-to-backend').forEach(button => {
      button.addEventListener('click', function(event) {
        const requestId = event.target.dataset.id;
        const request = requests.find(req => req.id === parseInt(requestId));
        if (request) {
          fetch('http://134.122.39.253:5000/run-script', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
          })
          .then(response => response.text())
          .then(data => {
            console.log('Success:', data);
          })
          .catch(error => {
            console.error('Error:', error);
          });
        }
      });
    });
  });

  // Clear logs button event listener
  clearLogsButton.addEventListener('click', function() {
    chrome.runtime.sendMessage({ action: 'clearLogs' }, function(response) {
      if (response.status === 'logs cleared') {
        requestTableBody.innerHTML = '';
      }
    });
  });

  // Highlight unsubmitted forms button event listener
  highlightFormsButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightForms' }, function(response) {
        if (response.status === 'Forms Highlighted') {
          console.log('Forms highlighted successfully.');
        }
      });
    });
  });
});
