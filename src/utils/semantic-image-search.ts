import { pipeline } from "@xenova/transformers";

export class SemanticImageSearcher {
  private imageEmbedder: any;
  private textEmbedder: any;
  public images: HTMLImageElement[] = [];

  constructor() { }

  async init(): Promise<void> {
    this.imageEmbedder = await pipeline(
      "image-feature-extraction",
      "Xenova/clip-vit-base-patch32",
      { quantized: true }
    );
    this.textEmbedder = await pipeline(
      "feature-extraction",
      "Xenova/clip-vit-base-patch32",
      { quantized: true }
    );
    console.log("✨ transformers.js CLIP model loaded");
  }

  collectImages(minSize = 100): HTMLImageElement[] {
    this.images = Array.from(document.querySelectorAll("img")).filter(
      (img) => img.src && img.naturalWidth > minSize && img.naturalHeight > minSize
    );
    return this.images;
  }

  async encodeImages(): Promise<Float32Array[]> {
    const embeds: Float32Array[] = [];
    for (const img of this.images) {
      try {
        const blob = await fetch(img.src).then((res) => res.blob());
        const result = await this.imageEmbedder(blob, {
          pooling: "mean",
          normalize: true,
        });
        embeds.push(new Float32Array(result.data));
      } catch (err) {
        console.warn("⚠️ Failed to embed image", img.src, err);
        embeds.push(new Float32Array(512));
      }
    }
    return embeds;
  }

  async encodeQuery(query: string): Promise<Float32Array> {
    const result = await this.textEmbedder(query, {
      pooling: "mean",
      normalize: true,
    });
    return new Float32Array(result.data);
  }

  cosineSimilarity(a: Float32Array, b: Float32Array): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  }

  async search(query: string, topK = 3): Promise<HTMLImageElement[]> {
    const images = this.collectImages();
    const [imageEmbeds, queryEmbed] = await Promise.all([
      this.encodeImages(),
      this.encodeQuery(query),
    ]);
    const scored = images.map((img, i) => ({
      img,
      score: this.cosineSimilarity(imageEmbeds[i], queryEmbed),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((item) => item.img);
  }

  highlight(images: HTMLImageElement[]): void {
    images.forEach((img) => {
      img.style.outline = "4px solid red";
    });
  }
}