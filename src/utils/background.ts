console.log("✅ Semantic Image Search background.ts loaded")
  ;
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RUN_QUERY") {
    chrome.tabs.sendMessage(sender.tab!.id!, msg, sendResponse);
    return true; // async response
  }
});

