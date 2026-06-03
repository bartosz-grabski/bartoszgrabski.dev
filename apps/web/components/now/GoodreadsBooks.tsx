import type { Book } from '@/lib/goodreads'

interface GoodreadsBooksProps {
  books: Book[]
}

export function GoodreadsBooks({ books }: GoodreadsBooksProps) {
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
