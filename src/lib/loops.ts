import { LoopsClient } from "loops"

// Lazy init to avoid errors when API key isn't set
let _client: LoopsClient | null = null

function getClient(): LoopsClient | null {
  if (!process.env.LOOPS_API_KEY) return null
  if (!_client) _client = new LoopsClient(process.env.LOOPS_API_KEY)
  return _client
}

export async function syncSubscriber(
  email: string,
  firstName?: string
): Promise<boolean> {
  const client = getClient()
  if (!client) return false

  try {
    await client.createContact({
      email,
      properties: {
        firstName: firstName ?? "",
        source: "diagonally-website",
      },
    })
    return true
  } catch {
    // Contact may already exist — that's OK
    return false
  }
}

export async function getSubscriberCount(): Promise<number | null> {
  // Loops doesn't expose a direct count API in the SDK
  return null
}
