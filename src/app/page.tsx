"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Zap, Sparkles, Film, Image as ImageIcon } from "lucide-react";

// Inline simplified components for deploy readiness
// Full modular components available in local project

type MediaType = "image" | "video";
type FilterType = "none" | "cyberpunk" | "matrix" | "midnight" | "vaporwave";

const TRENDING = [
  {
    before: "https://images.unsplash.com/photo-1618005182384-a83fe6b8b3c9?w=720&q=50",
    after: "https://images.unsplash.com/photo-1618005182384-a83fe6b8b3c9?w=1920&q=90",
  },
  {
    before: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=720&q=50",
    after: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=90",
  },
];

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    beforeUrl: string;
    afterUrl: string;
    videoUrl?: string;
    type: MediaType;
  } | null>(null);
  const [filter, setFilter] = useState<FilterType>("none");
  const [forceType, setForceType] = useState<MediaType | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const processUrl = async () => {
    if (!url.trim() && forceType !== "video") return;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, filter, forceType: forceType || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erreur");
      await new Promise((r) => setTimeout(r, 1200));
      setResult({
        beforeUrl: data.beforeUrl,
        afterUrl: data.afterUrl,
        videoUrl: data.videoUrl,
        type: data.type || "image",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoulette = () => {
    const r = TRENDING[Math.floor(Math.random() * TRENDING.length)];
    setResult({ beforeUrl: r.before, afterUrl: r.after, type: "image" });
  };

  const filterClass =
    filter === "cyberpunk"
      ? "contrast-125 saturate-150"
      : filter === "matrix"
        ? "contrast-125 hue-rotate-90"
        : filter === "midnight"
          ? "brightness-90 hue-rotate-180"
          : filter === "vaporwave"
            ? "saturate-150 hue-rotate-[300deg]"
            : "";

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center px-4 pt-20 pb-16">
      <div className="text-center mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-mono mb-5">
          <Zap className="w-3 h-3" />
          NEONWALL STUDIO — PHOTO + VIDEO
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          <span className="text-white">TikTok → </span>
          <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Wallpaper & Video
          </span>
        </h1>
        <p className="text-white/50 text-base max-w-xl mx-auto">
          Photos & Vidéos sans filigrane • Upscale 4K • Extraction de frames.
        </p>
      </div>

      <div className="flex gap-2 mb-5">
        {([null, "image", "video"] as const).map((t) => (
          <button
            key={String(t)}
            onClick={() => setForceType(t)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs border transition-all ${
              forceType === t
                ? t === "video"
                  ? "border-pink-400/50 bg-pink-500/10 text-pink-300"
                  : "border-cyan-400/50 bg-cyan-500/10 text-cyan-300"
                : "border-white/10 text-white/40"
            }`}
          >
            {t === "image" && <ImageIcon className="w-3.5 h-3.5" />}
            {t === "video" && <Film className="w-3.5 h-3.5" />}
            {t === null ? "Auto" : t === "image" ? "Photo" : "Vidéo"}
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl glass-strong rounded-2xl p-1.5 border border-white/10 mb-6">
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Colle l'URL TikTok (photo ou vidéo)..."
            className="flex-1 bg-transparent text-white placeholder:text-white/30 px-5 py-4 outline-none"
            disabled={isProcessing}
          />
          <button
            onClick={processUrl}
            disabled={isProcessing}
            className="px-6 py-3 rounded-xl bg-black border border-cyan-500/40 text-cyan-300 font-semibold text-sm disabled:opacity-50"
          >
            {isProcessing ? "Purification..." : "Lancer"}
          </button>
        </div>
      </div>

      <button
        onClick={handleRoulette}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-pink-300 mb-8"
      >
        <Shuffle className="w-4 h-4" />
        Surprise / Trending
      </button>

      {error && <p className="text-pink-400 text-sm mb-4">{error}</p>}

      {isProcessing && (
        <div className="flex flex-col items-center gap-4 my-8">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          <p className="text-sm text-white/50 font-mono">Purification en cours…</p>
        </div>
      )}

      <AnimatePresence>
        {result && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-6"
          >
            {result.type === "video" && result.videoUrl ? (
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black">
                <video src={result.videoUrl} controls playsInline className="w-full h-full object-contain" poster={result.afterUrl} />
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.afterUrl} alt="4K" className={`w-full h-full object-cover ${filterClass}`} />
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center">
              {(["none", "cyberpunk", "matrix", "midnight", "vaporwave"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs border ${
                    filter === f ? "border-cyan-400/60 text-cyan-300" : "border-white/10 text-white/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <a
                href={result.afterUrl}
                download="neonwall-4k.webp"
                className="px-6 py-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 text-cyan-300 font-semibold text-sm"
              >
                Télécharger 4K
              </a>
              {result.videoUrl && (
                <a
                  href={result.videoUrl}
                  download="neonwall-video.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-2xl border border-pink-500/40 bg-pink-500/10 text-pink-300 font-semibold text-sm"
                >
                  Télécharger Vidéo
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-auto pt-16 text-center text-xs text-white/20">
        NeonWall Studio — Next.js • Sharp • Framer Motion • Tailwind
      </footer>
    </main>
  );
}
