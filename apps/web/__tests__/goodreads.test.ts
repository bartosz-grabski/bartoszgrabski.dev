import { fetchCurrentlyReading, MOCK_BOOKS } from '@/lib/goodreads'

const fetchMock = jest.fn()
global.fetch = fetchMock

describe('fetchCurrentlyReading', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    delete process.env.GOODREADS_PROXY_URL
  })

  it('returns MOCK_BOOKS when GOODREADS_PROXY_URL is not set', async () => {
    const result = await fetchCurrentlyReading()
    expect(result).toEqual(MOCK_BOOKS)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('fetches from proxy when GOODREADS_PROXY_URL is set', async () => {
    process.env.GOODREADS_PROXY_URL = 'https://proxy.example.com'
    const books = [{ title: 'Test Book', author: 'Test Author' }]
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => books })

    const result = await fetchCurrentlyReading()
    expect(fetchMock).toHaveBeenCalledWith('https://proxy.example.com')
    expect(result).toEqual(books)
  })

  it('falls back to MOCK_BOOKS when fetch fails', async () => {
    process.env.GOODREADS_PROXY_URL = 'https://proxy.example.com'
    fetchMock.mockRejectedValueOnce(new Error('network error'))

    const result = await fetchCurrentlyReading()
    expect(result).toEqual(MOCK_BOOKS)
  })

  it('falls back to MOCK_BOOKS when response is not ok', async () => {
    process.env.GOODREADS_PROXY_URL = 'https://proxy.example.com'
    fetchMock.mockResolvedValueOnce({ ok: false })

    const result = await fetchCurrentlyReading()
    expect(result).toEqual(MOCK_BOOKS)
  })
})
