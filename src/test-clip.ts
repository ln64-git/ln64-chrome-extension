import { pipeline } from "@xenova/transformers";

(async () => {
  const classifier = await pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32");

  const output = await classifier(
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/JPEG_example_flower.jpg",
    ["flower", "car", "dog", "pizza"]
  );

  // Force correct typing
  const results = Array.isArray(output) && !Array.isArray(output[0])
    ? output as { label: string; score: number }[]
    : (output[0] as { label: string; score: number }[]);

  console.log("🧠 CLIP Top Matches:");
  for (const r of results) {
    console.log(`- ${r.label}: ${(r.score * 100).toFixed(2)}%`);
  }
})();
