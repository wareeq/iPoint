document.addEventListener("DOMContentLoaded", function() {
    const forms = document.querySelectorAll("form");
    forms.forEach(form => {
      if (!form.dataset.logged) {
        const indicator = document.createElement("span");
        indicator.textContent = "🔍";
        indicator.style.color = "red";
        indicator.style.marginLeft = "10px";
        form.appendChild(indicator);
        form.dataset.logged = true;
      }
    });
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "highlightForms") {
      const forms = document.querySelectorAll("form:not([data-highlighted])");
      forms.forEach(form => {
        form.style.border = "2px solid red";
        form.dataset.highlighted = "true";
      });
      sendResponse({ status: "Forms Highlighted" });
    }
  });
  