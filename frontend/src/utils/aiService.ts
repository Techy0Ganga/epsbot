// utils/aiService.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export async function askBot(token: string, question: string): Promise<{ answer: string }> {
  const res = await fetch(`${API_URL}/bot/ask`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
  })

  if (!res.ok) throw new Error('Bot request failed')
  return res.json()
}