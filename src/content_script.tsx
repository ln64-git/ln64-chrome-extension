import { SemanticImageSearcher } from "./utils/semantic-image-search";

function startSemanticSearchUI() {
  const searcher = new SemanticImageSearcher();
  searcher.init().then(() => {
    const box = document.createElement("div");
    box.style.position = "fixed";
    box.style.top = "10px";
    box.style.right = "10px";
    box.style.zIndex = "9999";
    box.style.backgroundColor = "#fff";
    box.style.padding = "8px";
    box.style.border = "1px solid #ccc";
    box.innerHTML = `
      <input type="text" id="vectorQuery" placeholder="Search images..." />
      <button id="runQuery">🔍</button>
    `;
    document.body.appendChild(box);

    const runQuery = async () => {
      const query = (document.getElementById("vectorQuery") as HTMLInputElement).value;
      const results = await searcher.search(query, 3);
      searcher.highlight(results);
      console.log("🔍 Found images:", results.map((img) => img.src));
    };

    document.getElementById("runQuery")?.addEventListener("click", runQuery);
    document.getElementById("vectorQuery")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") runQuery();
    });

    // handle background.js requests
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === "RUN_QUERY") {
        const query = msg.query;
        searcher.images = msg.images.map((img: { src: string }) => {
          const el = new Image();
          el.src = img.src;
          return el;
        });
        searcher.search(query, 3).then((imgs) => {
          sendResponse({ results: imgs.map((img) => ({ src: img.src })) });
        });
        return true;
      }
    });
  });
}

console.log("✅ Semantic Image Search content script loaded");
startSemanticSearchUI();
