let postRequests = [];

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    if (details.method === "POST") {
      let requestBody = {};

      if (details.requestBody && details.requestBody.formData) {
        requestBody = details.requestBody.formData;
      } else if (details.requestBody && details.requestBody.raw) {
        // If formData is not available, try to parse raw data
        let raw = details.requestBody.raw[0].bytes;
        let decoder = new TextDecoder("utf-8");
        let text = decoder.decode(raw);
        let params = new URLSearchParams(text);
        params.forEach((value, key) => {
          requestBody[key] = value;
        });
      }

      let request = {
        url: details.url,
        requestBody: requestBody,
        timeStamp: details.timeStamp
      };

      postRequests.push(request);
      chrome.storage.local.set({ postRequests: postRequests });
    }
  },
  { urls: ["<all_urls>"] },
  ["requestBody"]
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
