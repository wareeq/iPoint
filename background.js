let postRequests = [];

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if (details.method === "POST") {
      let rawRequestBody = "";
      let headers = details.requestHeaders.map(header => `${header.name}: ${header.value}`).join('\n');

      chrome.webRequest.onBeforeRequest.addListener(
        function(details) {
          if (details.method === "POST") {
            if (details.requestBody && details.requestBody.raw) {
              // Decode the raw bytes to string
              let raw = details.requestBody.raw[0].bytes;
              let decoder = new TextDecoder("utf-8");
              rawRequestBody = decoder.decode(raw);
            }

            let request = {
              id: postRequests.length + 1,
              method: details.method,
              url: details.url,
              timeStamp: details.timeStamp,
              headers: headers,
              rawRequest: rawRequestBody
            };

            postRequests.push(request);
            chrome.storage.local.set({ postRequests: postRequests });
          }
        },
        { urls: ["<all_urls>"] },
        ["requestBody"]
      );
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

// Function to clear the logs
function clearLogs() {
  postRequests = [];
  chrome.storage.local.set({ postRequests: postRequests });
}

// Listen for messages from the content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clearLogs") {
    clearLogs();
    sendResponse({ status: "logs cleared" });
  }
});
