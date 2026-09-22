import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import MessageBubble from './MessageBubble'
import type { Message } from '../types'
import { getStrings } from '../i18n'

const strings = getStrings('Español')

function assistantMessage(content: string): Message {
  return { id: '1', role: 'assistant', content }
}

describe('MessageBubble', () => {
  it('renders markdown formatting', () => {
    const { container } = render(<MessageBubble message={assistantMessage('**negrita**')} strings={strings} />)
    expect(container.querySelector('strong')?.textContent).toBe('negrita')
  })

  it('removes script tags from assistant content', () => {
    const { container } = render(
      <MessageBubble message={assistantMessage('<script>alert(1)</script>Hola')} strings={strings} />,
    )
    expect(container.querySelector('script')).toBeNull()
  })
})
