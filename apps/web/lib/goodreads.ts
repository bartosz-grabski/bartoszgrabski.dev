export interface Book {
  title: string
  author: string
}

export const MOCK_BOOKS: Book[] = [
  { title: 'A Philosophy of Software Design', author: 'John Ousterhout' },
  { title: 'Working in Public', author: 'Nadia Eghbal' },
]

export async function fetchCurrentlyReading(): Promise<Book[]> {
  const url = process.env.GOODREADS_PROXY_URL
  if (!url) return MOCK_BOOKS
  try {
    const res = await fetch(url)
    if (!res.ok) return MOCK_BOOKS
    return res.json() as Promise<Book[]>
  } catch {
    return MOCK_BOOKS
  }
}
