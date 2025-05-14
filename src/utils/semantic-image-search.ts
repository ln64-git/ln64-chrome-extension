import { pipeline } from "@xenova/transformers";

let imageEmbedder: any;
let textEmbedder: any;

export async function initCLIP() {
  imageEmbedder = await pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32", { quantized: true });
  textEmbedder = await pipeline("feature-extraction", "Xenova/clip-vit-base-patch32", { quantized: true });
  console.log("✨ CLIP models loaded in background");
}

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export async function searchImages(images: { name: string; src: string }[], query: string, topK = 3) {
  const queryEmbed = new Float32Array((await textEmbedder(query, { pooling: "mean", normalize: true })).data);

  const imageEmbeds = await Promise.all(
    images.map(async (img) => {
      try {
        const blob = await fetch(img.src).then((res) => res.blob());
        const result = await imageEmbedder(blob, { pooling: "mean", normalize: true });
        return new Float32Array(result.data);
      } catch (err) {
        console.warn("⚠️ Failed to embed", img.name, err);
        return new Float32Array(512);
      }
    })
  );

  const scored = images.map((img, i) => ({
    img,
    score: cosineSimilarity(imageEmbeds[i], queryEmbed),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.img);
}
