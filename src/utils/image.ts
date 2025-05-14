export function collectImages(): { name: string; src: string }[] {
  const images = Array.from(document.querySelectorAll("img"))
    .filter(img => img.src && img.naturalWidth > 100) // avoid tiny or blank images
    .map(img => {
      try {
        const url = new URL(img.src);
        const name = url.pathname.split("/").pop() || "(unnamed)";
        return { name, src: img.src };
      } catch {
        return { name: "(invalid)", src: img.src };
      }
    });

  console.log("🖼️ All captured images:", images);

  return images;
}