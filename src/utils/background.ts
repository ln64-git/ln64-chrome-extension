console.log("✅ Semantic Image Search background.ts loaded");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "RUN_QUERY") {
    const { query, images } = msg;

    console.log("📨 Received query:", query);
    console.log("🖼️ Images received:", images.length);

    fetch("http://localhost:3100/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, images }),
    })
      .then((res) => {
        console.log("📥 Server response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("📦 Raw server response:", data);
        const results = Array.isArray(data?.results) ? data.results : [];
        sendResponse({ results });
      })
      .catch((err) => {
        console.error("❌ Error contacting CLIP server:", err);
        sendResponse({ results: [] });
      });

    return true; // Keeps the message channel open for async response
  }
});
