console.log("✅ Semantic Image Search background.ts loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RUN_QUERY") {
    const { query, images } = msg;

    fetch("http://localhost:3100/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, images }),
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ results: data.results });
      })
      .catch((err) => {
        console.error("❌ Error contacting CLIP server:", err);
        sendResponse({ results: [] });
      });

    return true; // async
  }
});
