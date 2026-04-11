"use client"

import { motion } from "framer-motion"

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)

    // YouTube
    if (u.hostname === "www.youtube.com" || u.hostname === "youtube.com") {
      const v = u.searchParams.get("v")
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1)
      if (v) return `https://www.youtube.com/embed/${v}`
    }
    if (u.hostname === "www.youtube.com" && u.pathname.startsWith("/embed/")) {
      return url
    }

    // Vimeo
    if (u.hostname === "vimeo.com" || u.hostname === "www.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0]
      if (id) return `https://player.vimeo.com/video/${id}`
    }
    if (u.hostname === "player.vimeo.com") {
      return url
    }

    return null
  } catch {
    return null
  }
}

export default function VideoEmbedBlock({ props }: { props: Record<string, unknown> }) {
  const url = (props.url as string) ?? ""
  const caption = (props.caption as string) ?? ""

  const embedUrl = url ? getEmbedUrl(url) : null

  return (
    <section className="bg-cream py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6"
      >
        {embedUrl ? (
          <figure>
            <div className="relative w-full rounded-3xl overflow-hidden shadow-soft-md bg-black" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                title={caption || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            {caption && (
              <figcaption className="mt-4 text-center text-sm text-text-dark/50">
                {caption}
              </figcaption>
            )}
          </figure>
        ) : (
          <div className="bg-cream-dark rounded-3xl h-64 flex items-center justify-center">
            <p className="text-text-dark/30 text-sm">
              {url ? "Unsupported video URL" : "No video URL provided"}
            </p>
          </div>
        )}
      </motion.div>
    </section>
  )
}
