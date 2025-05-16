console.log("✅ Semantic Image Search content script loaded");

function collectImages(): { name: string; src: string }[] {
  return Array.from(document.querySelectorAll("img"))
    .filter((img) => img.src && img.naturalWidth > 100)
    .map((img) => {
      try {
        const url = new URL(img.src);
        return { name: url.pathname.split("/").pop() || "(unnamed)", src: img.src };
      } catch {
        return { name: "(invalid)", src: img.src };
      }
    });
}

function highlightImages(results: { src: string }[]) {
  const map = new Set(results.map((r) => r.src));
  Array.from(document.querySelectorAll("img")).forEach((img) => {
    if (map.has(img.src)) img.style.outline = "4px solid red";
  });
}

function startSemanticSearchUI() {
  console.log("🚀 Starting Semantic Search UI");

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

  const runQuery = () => {
    const query = (document.getElementById("vectorQuery") as HTMLInputElement).value;
    const images = collectImages();

    chrome.runtime.sendMessage({ type: "RUN_QUERY", query, images }, (response) => {
      if (!response || !Array.isArray(response.results)) {
        console.warn("⚠️ Invalid response from background:", response);
        return;
      }

      console.log("🔍 Found results", response);
      highlightImages(response.results);
    });

  };

  document.getElementById("runQuery")?.addEventListener("click", runQuery);
  document.getElementById("vectorQuery")?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") runQuery();
  });
}

console.log("✅ Semantic Image Search content script loaded");
startSemanticSearchUI();
