// src/lib/visual-editor/message-bridge.ts
import type { ParentToCanvasMessage, CanvasToParentMessage } from "./types"

const BRIDGE_CHANNEL = "diagonally-editor"

interface BridgeMessage {
  channel: typeof BRIDGE_CHANNEL
  payload: ParentToCanvasMessage | CanvasToParentMessage
}

function isBridgeMessage(data: unknown): data is BridgeMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    "channel" in data &&
    (data as BridgeMessage).channel === BRIDGE_CHANNEL
  )
}

/** Send a message from the parent frame to the canvas iframe */
export function sendToCanvas(iframe: HTMLIFrameElement, message: ParentToCanvasMessage) {
  iframe.contentWindow?.postMessage(
    { channel: BRIDGE_CHANNEL, payload: message } satisfies BridgeMessage,
    window.location.origin
  )
}

/** Send a message from the canvas iframe to the parent frame */
export function sendToParent(message: CanvasToParentMessage) {
  window.parent.postMessage(
    { channel: BRIDGE_CHANNEL, payload: message } satisfies BridgeMessage,
    window.location.origin
  )
}

/** Listen for messages from the canvas (used in parent frame) */
export function onCanvasMessage(
  handler: (message: CanvasToParentMessage) => void
): () => void {
  function listener(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    if (!isBridgeMessage(event.data)) return
    handler(event.data.payload as CanvasToParentMessage)
  }
  window.addEventListener("message", listener)
  return () => window.removeEventListener("message", listener)
}

/** Listen for messages from the parent (used in canvas iframe) */
export function onParentMessage(
  handler: (message: ParentToCanvasMessage) => void
): () => void {
  function listener(event: MessageEvent) {
    if (event.origin !== window.location.origin) return
    if (!isBridgeMessage(event.data)) return
    handler(event.data.payload as ParentToCanvasMessage)
  }
  window.addEventListener("message", listener)
  return () => window.removeEventListener("message", listener)
}
