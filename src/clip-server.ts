import express from "express";
import * as Canvas from "canvas";
import { env, pipeline } from "@xenova/transformers";

(env as any).Canvas = {
  Canvas: Canvas.Canvas,
  Image: Canvas.Image,
  ImageData: Canvas.ImageData,
};

const app = express();
app.use(express.json({ limit: "50mb" }));

let imageEmbedder: any;
let textEmbedder: any;

(async () => {
  imageEmbedder = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32", { quantized: true });
  textEmbedder = await pipeline("feature-extraction", "Xenova/clip-vit-base-patch32", { quantized: true });

  try {
    const testImage = await Canvas.loadImage("https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/JPEG_example_flower.jpg/320px-JPEG_example_flower.jpg");
    const canvas = Canvas.createCanvas(testImage.width, testImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(testImage, 0, 0);
    const buffer = canvas.toBuffer("image/png");
    const blob = new Blob([buffer], { type: "image/png" });

    const testResult = await imageEmbedder(blob, {
      pooling: "mean",
      normalize: true,
    });

    console.log("✅ TEST embedding length:", testResult.data.length);
  } catch (e) {
    console.error("❌ TEST image embedding failed:", e);
  }

  console.log("✅ CLIP server is ready.");
})();

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

app.post("/search", (req, res) => {
  (async () => {
    try {
      const { query, images } = req.body;

      if (!query || !Array.isArray(images)) {
        return res.status(400).json({ results: [] });
      }

      const queryEmbed = new Float32Array(
        (await textEmbedder(query, { pooling: "mean", normalize: true })).data
      );

      const results = await Promise.all(
        images.map(async (img) => {
          try {
            const image = await Canvas.loadImage(img.src);
            const embedding = await imageEmbedder(image, {
              pooling: "mean",
              normalize: true,
            });

            const score = cosineSimilarity(
              new Float32Array(embedding.data),
              queryEmbed
            );

            return { ...img, score };
          } catch (err) {
            console.warn("⚠️ Failed to process image:", img.name, err);
            return { ...img, score: 0 };
          }
        })
      );

      const top = results.sort((a, b) => b.score - a.score).slice(0, 3);
      res.json({ results: top });
    } catch (err) {
      console.error("❌ Server error:", err);
      res.status(500).json({ results: [] });
    }
  })();
});

app.listen(3100, () => {
  console.log("🚀 CLIP Server running at http://localhost:3100");
});
