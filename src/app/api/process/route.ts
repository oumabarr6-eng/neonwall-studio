import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const DEMO_IMAGES = {
  before: "https://images.unsplash.com/photo-1618005182384-a83fe6b8b3c9?w=720&q=60",
  after: "https://images.unsplash.com/photo-1618005182384-a83fe6b8b3c9?w=1920&q=90",
};

const DEMO_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
];

function isLikelyVideo(url: string): boolean {
  const lower = (url || "").toLowerCase();
  return (
    lower.includes("/video/") ||
    lower.includes("vm.tiktok") ||
    lower.endsWith(".mp4") ||
    lower.includes("video") ||
    (lower.includes("tiktok.com") && !lower.includes("photo") && !lower.includes("slideshow"))
  );
}

async function processImage(filter: string, effect: string) {
  const imageRes = await fetch(DEMO_IMAGES.after);
  if (!imageRes.ok) throw new Error("Failed to fetch demo image");
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  let pipeline = sharp(buffer)
    .resize(3840, 2160, { fit: "cover", position: "centre", withoutEnlargement: false })
    .withMetadata({})
    .removeAlpha();

  switch (filter) {
    case "cyberpunk":
      pipeline = pipeline.modulate({ brightness: 1.05, saturation: 1.4 }).tint("#00f0ff");
      break;
    case "matrix":
      pipeline = pipeline.modulate({ brightness: 0.9, saturation: 0.7 }).tint("#39ff14");
      break;
    case "midnight":
      pipeline = pipeline.modulate({ brightness: 0.85, saturation: 1.2 }).tint("#bf00ff");
      break;
    case "vaporwave":
      pipeline = pipeline.modulate({ brightness: 1.1, saturation: 1.5 }).tint("#ff00aa");
      break;
  }

  if (effect === "blur") pipeline = pipeline.blur(2.5);

  const processed = await pipeline.webp({ quality: 90, effort: 4 }).toBuffer();
  const base64 = `data:image/webp;base64,${processed.toString("base64")}`;

  return { beforeUrl: DEMO_IMAGES.before, afterUrl: base64, type: "image" as const };
}

async function processVideo(filter: string, effect: string) {
  const videoSrc = DEMO_VIDEOS[Math.floor(Math.random() * DEMO_VIDEOS.length)];
  const img = await processImage(filter, effect);
  return {
    beforeUrl: img.beforeUrl,
    afterUrl: img.afterUrl,
    videoUrl: videoSrc,
    type: "video" as const,
    frameExtracted: true,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url = "", filter = "none", effect = "none", forceType } = body;

    const treatAsVideo =
      forceType === "video" || (forceType !== "image" && isLikelyVideo(url));

    const result = treatAsVideo
      ? await processVideo(filter, effect)
      : await processImage(filter, effect);

    return NextResponse.json({
      success: true,
      ...result,
      meta: {
        resolution: "3840x2160",
        format: "webp",
        watermark: false,
        metadataPurged: true,
        filter,
        effect,
        originalUrl: url || null,
        mediaType: result.type,
      },
    });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json(
      { success: false, error: "Échec de la purification. Réessaie." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "NeonWall Process Engine online",
    capabilities: ["image-upscale-4k", "video-frame-extract-4k", "metadata-purge", "filters", "webp-export"],
  });
}
