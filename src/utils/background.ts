chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "RUN_QUERY") {
    console.log("User query:", message.query);
    // 🚧 Future: send to CLIP model here
  }
});
console.log("✅ Background script loaded");