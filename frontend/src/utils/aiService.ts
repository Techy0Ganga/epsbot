// utils/aiService.ts
export async function askBot(token: string, question: string): Promise<{ answer: string }> {
  const res = await fetch('http://localhost:3333/bot/ask', {
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