import { collectImages } from "./utils/image";

function injectUI() {
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

  document.getElementById("runQuery")?.addEventListener("click", () => {
    const query = (document.getElementById("vectorQuery") as HTMLInputElement).value;
    const images = collectImages();
    chrome.runtime.sendMessage({ type: "RUN_QUERY", query, images });
  });
}

console.log("✅ Content script loaded");

injectUI();
