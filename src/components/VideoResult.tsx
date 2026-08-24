"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Image as ImageIcon, Film } from "lucide-react";

interface VideoResultProps {
  videoUrl: string;
  frameUrl: string;
  filterClass?: string;
}

export default function VideoResult({
  videoUrl,
  frameUrl,
  filterClass = "",
}: VideoResultProps) {
  const [mode, setMode] = useState<"video" | "frame">("video");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-3xl mx-auto space-y-4"
    >
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode("video")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
            mode === "video"
              ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-300"
              : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          Vidéo clean
        </button>
        <button
          onClick={() => setMode("frame")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
            mode === "frame"
              ? "border-pink-400/60 bg-pink-500/10 text-pink-300"
              : "border-white/10 bg-white/5 text-white/50 hover:text-white/80"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Frame 4K extraite
        </button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/10 neon-border aspect-video bg-black">
        {mode === "video" ? (
          <video
            src={videoUrl}
            controls
            playsInline
            className="w-full h-full object-contain"
            poster={frameUrl}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={frameUrl}
            alt="Frame 4K extraite"
            className={`w-full h-full object-cover ${filterClass}`}
          />
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-cyan-500/30 text-[10px] font-mono text-cyan-400 tracking-wider">
            {mode === "video" ? "NO WATERMARK" : "4K FRAME"}
          </span>
        </div>
      </div>

      <p className="text-center text-xs text-white/40">
        {mode === "video"
          ? "Vidéo TikTok sans filigrane (démo) — téléchargeable"
          : "Meilleure frame extraite • Upscalée 4K • Métadonnées purgées"}
      </p>
    </motion.div>
  );
}
