import type { TiptapJSON, TiptapNode } from "@/lib/blocks/types"
import React from "react"

interface TiptapRendererProps {
  content: TiptapJSON
}

type Mark = { type: string; attrs?: Record<string, unknown> }

function renderTextWithMarks(
  text: string,
  marks: Mark[] | undefined,
  index: number
): React.ReactNode {
  let result: React.ReactNode = text
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        result = <strong key={index}>{result}</strong>
        break
      case "italic":
        result = <em key={index}>{result}</em>
        break
      case "underline":
        result = <u key={index}>{result}</u>
        break
      case "strike":
        result = <del key={index}>{result}</del>
        break
      case "code":
        result = (
          <code
            key={index}
            className="bg-text-dark/5 rounded px-1.5 py-0.5 text-sm font-mono"
          >
            {result}
          </code>
        )
        break
      case "link":
        result = (
          <a
            key={index}
            href={(mark.attrs?.href as string) ?? "#"}
            className="text-blue-deep underline hover:text-blue-primary transition-colors"
            target={(mark.attrs?.target as string) ?? "_blank"}
            rel="noopener noreferrer"
          >
            {result}
          </a>
        )
        break
      case "superscript":
        result = <sup key={index}>{result}</sup>
        break
      case "subscript":
        result = <sub key={index}>{result}</sub>
        break
      case "highlight":
        result = (
          <mark key={index} className="bg-gold/20 rounded px-0.5">
            {result}
          </mark>
        )
        break
    }
  }
  return result
}

function renderNode(node: TiptapNode, index: number): React.ReactNode {
  // Text node — apply marks and return
  if (node.text !== undefined) {
    return renderTextWithMarks(node.text, node.marks, index)
  }

  const children = node.content?.map((child, i) => renderNode(child, i))

  switch (node.type) {
    case "paragraph":
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {children}
        </p>
      )

    case "heading": {
      const level = (node.attrs?.level as number) ?? 2
      if (level === 2) {
        return (
          <h2
            key={index}
            className="font-display text-2xl font-bold text-text-dark mt-8 mb-3"
          >
            {children}
          </h2>
        )
      }
      if (level === 3) {
        return (
          <h3
            key={index}
            className="font-display text-xl font-bold text-text-dark mt-6 mb-2"
          >
            {children}
          </h3>
        )
      }
      return (
        <h4
          key={index}
          className="font-display text-lg font-bold text-text-dark mt-6 mb-2"
        >
          {children}
        </h4>
      )
    }

    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
          {children}
        </ul>
      )

    case "orderedList":
      return (
        <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">
          {children}
        </ol>
      )

    case "listItem":
      return <li key={index}>{children}</li>

    case "taskList":
      return (
        <ul key={index} className="space-y-2 mb-4">
          {children}
        </ul>
      )

    case "taskItem": {
      const checked = Boolean(node.attrs?.checked)
      return (
        <li key={index} className="flex items-start gap-2">
          <input
            type="checkbox"
            defaultChecked={checked}
            disabled
            className="mt-1 flex-shrink-0"
          />
          <span>{children}</span>
        </li>
      )
    }

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="pl-4 border-l-2 border-gold/40 italic text-text-dark/70 my-6"
        >
          {children}
        </blockquote>
      )

    case "codeBlock":
      return (
        <pre
          key={index}
          className="bg-space-deep text-text-light rounded-xl p-5 overflow-x-auto my-6"
        >
          <code
            className="text-sm font-mono"
            data-language={(node.attrs?.language as string) ?? ""}
          >
            {children}
          </code>
        </pre>
      )

    case "table":
      return (
        <div key={index} className="overflow-x-auto my-6">
          <table className="w-full border-collapse">{children}</table>
        </div>
      )

    case "tableRow":
      return <tr key={index}>{children}</tr>

    case "tableHeader":
      return (
        <th
          key={index}
          className="border border-text-dark/10 bg-cream-dark px-4 py-2 text-left font-display font-semibold text-sm"
        >
          {children}
        </th>
      )

    case "tableCell":
      return (
        <td
          key={index}
          className="border border-text-dark/10 px-4 py-2"
        >
          {children}
        </td>
      )

    case "horizontalRule":
      return <hr key={index} className="border-t border-text-dark/10 my-8" />

    case "image": {
      const src = (node.attrs?.src as string) ?? ""
      const alt = (node.attrs?.alt as string) ?? ""
      const title = (node.attrs?.title as string) ?? ""
      return (
        <figure key={index} className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="rounded-xl w-full" />
          {title && (
            <figcaption className="text-sm text-text-dark/50 mt-2 text-center">
              {title}
            </figcaption>
          )}
        </figure>
      )
    }

    case "video": {
      const src = (node.attrs?.src as string) ?? ""
      const provider = (node.attrs?.provider as string) ?? ""
      const videoId = (node.attrs?.videoId as string) ?? ""

      if (provider === "youtube" && videoId) {
        return (
          <div key={index} className="my-6 aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-xl"
              allowFullScreen
              loading="lazy"
              title="YouTube video"
            />
          </div>
        )
      }
      if (provider === "vimeo" && videoId) {
        return (
          <div key={index} className="my-6 aspect-video">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              className="w-full h-full rounded-xl"
              allowFullScreen
              loading="lazy"
              title="Vimeo video"
            />
          </div>
        )
      }
      return (
        <div key={index} className="my-6">
          <video src={src} controls className="w-full rounded-xl" />
        </div>
      )
    }

    case "embed": {
      const url = (node.attrs?.url as string) ?? ""

      if (/twitter\.com|x\.com/i.test(url)) {
        return (
          <div key={index} className="my-6 flex justify-center">
            <blockquote className="twitter-tweet" data-theme="light">
              <a href={url}>{url}</a>
            </blockquote>
          </div>
        )
      }

      return (
        <div key={index} className="my-6">
          <iframe
            src={url}
            className="w-full rounded-xl border border-text-dark/10"
            style={{ minHeight: "400px" }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            title="Embedded content"
          />
        </div>
      )
    }

    case "hardBreak":
      return <br key={index} />

    // Tiptap wraps table sections in thead/tbody
    case "tableBody":
    case "tableHead":
    case "tableFooter":
      return <React.Fragment key={index}>{children}</React.Fragment>

    default:
      return <React.Fragment key={index}>{children}</React.Fragment>
  }
}

export function TiptapRenderer({ content }: TiptapRendererProps) {
  return (
    <div className="prose-diagonally">
      {content.content.map((node, i) => renderNode(node, i))}
    </div>
  )
}
