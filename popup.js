document.addEventListener('DOMContentLoaded', function() {
    const clearLogsButton = document.getElementById('clearLogs');
    const requestsDiv = document.getElementById('requests');
  
    // Fetch and display the logged POST requests
    chrome.storage.local.get('postRequests', function(data) {
      const requests = data.postRequests || [];
      requests.forEach(request => {
        const requestDiv = document.createElement('div');
        requestDiv.className = 'request';
        requestDiv.innerHTML = `
          <p><strong>URL:</strong> ${request.url}</p>
          <p><strong>Body:</strong> ${JSON.stringify(request.requestBody)}</p>
          <p><strong>Time:</strong> ${new Date(request.timeStamp).toLocaleString()}</p>
        `;
        requestsDiv.appendChild(requestDiv);
      });
    });
  
    // Clear logs button event listener
    clearLogsButton.addEventListener('click', function() {
      chrome.runtime.sendMessage({ action: 'clearLogs' }, function(response) {
        if (response.status === 'logs cleared') {
          requestsDiv.innerHTML = '';
        }
      });
    });
  });
  