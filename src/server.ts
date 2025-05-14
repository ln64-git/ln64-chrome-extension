// server.ts (or server.js)
import express from "express";
import { pipeline } from "@xenova/transformers";

const app = express();
app.use(express.json({ limit: "50mb" }));

let imageEmbedder: any;
let textEmbedder: any;

(async () => {
  imageEmbedder = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32", { quantized: true });
  textEmbedder = await pipeline("feature-extraction", "Xenova/clip-vit-base-patch32", { quantized: true });
  console.log("✅ CLIP models ready");
})();

app.post("/search", async (req, res) => {
  const { query, images } = req.body;

  const queryEmbed = new Float32Array(
    (await textEmbedder(query, { pooling: "mean", normalize: true })).data
  );

  const results = await Promise.all(
    images.map(async (img: { src: string }) => {
      try {
        const blob = await fetch(img.src).then((r) => r.blob());
        const result = await imageEmbedder(blob, { pooling: "mean", normalize: true });
        return { ...img, score: cosineSimilarity(new Float32Array(result.data), queryEmbed) };
      } catch {
        return { ...img, score: 0 };
      }
    })
  );

  const top = results.sort((a, b) => b.score - a.score).slice(0, 3);
  res.json({ results: top });
});

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

app.listen(3100, () => console.log("🚀 CLIP server running on http://localhost:3100"));
