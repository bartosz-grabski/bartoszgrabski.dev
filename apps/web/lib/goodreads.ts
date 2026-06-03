export interface Book {
  title: string
  author: string
}

export interface GoodreadsResult {
  books: Book[]
  updatedAt: string | null
}

interface GoodreadsResponse {
  book: {
    title: string
    author: string
    image?: string
    link?: string
  }
  update?: {
    date?: string
  }
}

export const MOCK_BOOKS: Book[] = [
  { title: 'A Philosophy of Software Design', author: 'John Ousterhout' },
  { title: 'Working in Public', author: 'Nadia Eghbal' },
]

export async function fetchCurrentlyReading(): Promise<GoodreadsResult> {
  const url = process.env.GOODREADS_PROXY_URL
  if (!url) return { books: MOCK_BOOKS, updatedAt: null }
  try {
    const res = await fetch(url)
    if (!res.ok) return { books: MOCK_BOOKS, updatedAt: null }
    const data = await res.json() as GoodreadsResponse
    if (!data?.book?.title) return { books: MOCK_BOOKS, updatedAt: null }
    return {
      books: [{ title: data.book.title, author: data.book.author }],
      updatedAt: data.update?.date ?? null,
    }
  } catch {
    return { books: MOCK_BOOKS, updatedAt: null }
  }
}
