document.addEventListener('DOMContentLoaded', function() {
  const clearLogsButton = document.getElementById('clearLogs');
  const requestTableBody = document.getElementById('requestTableBody');
  const highlightFormsButton = document.getElementById('highlightForms');
  const sendToBackendButton = document.getElementById('sendToBackend');

  // Fetch and display the logged POST requests
  chrome.storage.local.get('postRequests', function(data) {
    const requests = data.postRequests || [];
    requests.forEach(request => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${request.id}</td>
        <td>${request.method}</td>
        <td><a href="#" class="toggle-details">${request.url}</a></td>
      `;

      const headersString = request.headers.map(header => `${header.name}: ${header.value}`).join('\n');

      const detailsRow = document.createElement('tr');
      detailsRow.classList.add('details');
      detailsRow.innerHTML = `
        <td colspan="3">
          <div class="raw-request">
            ${request.method} ${new URL(request.url).pathname} HTTP/1.1\n
            Host: ${new URL(request.url).host}\n
            ${headersString}\n
            \n
            ${request.rawRequest}
          </div>
        </td>
      `;

      row.querySelector('.toggle-details').addEventListener('click', function(event) {
        event.preventDefault();
        detailsRow.classList.toggle('details');
      });

      requestTableBody.appendChild(row);
      requestTableBody.appendChild(detailsRow);
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

  // Send requests to backend button event listener
  sendToBackendButton.addEventListener('click', function() {
    chrome.storage.local.get('postRequests', function(data) {
      fetch('https://your-backend-server.com/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data.postRequests)
      })
      .then(response => response.json())
      .then(data => console.log('Success:', data))
      .catch(error => console.error('Error:', error));
    });
  });
});
