import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchCategories, sendChatStream } from './api'

function mockFetchStream(chunks: string[]) {
  const encoder = new TextEncoder()
  let index = 0
  const reader = {
    read: async () => {
      if (index < chunks.length) {
        return { done: false, value: encoder.encode(chunks[index++]) }
      }
      return { done: true, value: undefined }
    },
  }
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    body: { getReader: () => reader },
    json: async () => ({}),
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('sendChatStream', () => {
  it('parses SSE events split across network chunks', async () => {
    const source = {
      titulo: 'Ley Organica',
      numero: '3',
      anio: '2005',
      tipo: 'Ley Organica',
      fragmento: 'fragmento',
      doc_id: 3,
    }
    const confidence = { level: 'alto', percentage: 90, source_count: 1 }

    vi.stubGlobal(
      'fetch',
      mockFetchStream([
        'data: {"chunk": "Hola "}\n\ndata: {"ch',
        'unk": "mundo"}\n\n',
        `data: {"done": true, "sources": [${JSON.stringify(source)}], "confidence": ${JSON.stringify(confidence)}}\n\n`,
      ]),
    )

    const received: string[] = []
    let doneCalled = false
    const result = await sendChatStream({ query: 'consulta' }, (chunk, done) => {
      if (done) doneCalled = true
      else received.push(chunk)
    })

    expect(received).toEqual(['Hola ', 'mundo'])
    expect(doneCalled).toBe(true)
    expect(result.sources).toHaveLength(1)
    expect(result.confidence.percentage).toBe(90)
  })

  it('throws when the stream emits an error event', async () => {
    vi.stubGlobal('fetch', mockFetchStream(['data: {"error": "boom"}\n\n']))

    await expect(sendChatStream({ query: 'consulta' }, () => {})).rejects.toThrow('boom')
  })
})

describe('fetchCategories', () => {
  it('returns an empty array when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))
    expect(await fetchCategories()).toEqual([])
  })
})
