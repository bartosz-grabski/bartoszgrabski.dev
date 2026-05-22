'use client'
import { useState, useEffect } from 'react'
import type { Book } from '@/lib/goodreads'

interface GoodreadsBooksProps {
  initialBooks: Book[]
}

export function GoodreadsBooks({ initialBooks }: GoodreadsBooksProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_GOODREADS_PROXY_URL
    if (!url) return
    fetch(url)
      .then(r => r.ok ? r.json() as Promise<Book[]> : null)
      .then(data => { if (data) setBooks(data) })
      .catch(() => {})
  }, [])

  return (
    <>
      {books.map((book, i) => (
        <p className="now-line" key={i}>
          <span className="book-title">{book.title}</span>
          <span className="book-author"> — {book.author}</span>
        </p>
      ))}
    </>
  )
}
