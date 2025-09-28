import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PostCard } from '../post-card'
import type { Post } from '@/types'

const mockPost: Post = {
  id: 1,
  title: 'Test Post Title',
  body: 'This is a test post body content that should be displayed in the card.',
  userId: 1,
  author: {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
  },
  commentsCount: 5,
  createdAt: '2024-01-15T10:00:00Z',
}

describe('PostCard', () => {
  it('should render post information correctly', () => {
    render(<PostCard post={mockPost} />)

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    expect(screen.getByText(/This is a test post body content/)).toBeInTheDocument()
    expect(screen.getByText('By John Doe (@johndoe)')).toBeInTheDocument()
    expect(screen.getByText('5 comments')).toBeInTheDocument()
    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Read More' })).toBeInTheDocument()
  })

  it('should render post without optional fields', () => {
    const minimalPost: Post = {
      id: 2,
      title: 'Minimal Post',
      body: 'Minimal post body',
      userId: 1,
    }

    render(<PostCard post={minimalPost} />)

    expect(screen.getByText('Minimal Post')).toBeInTheDocument()
    expect(screen.getByText('Minimal post body')).toBeInTheDocument()
    expect(screen.queryByText(/By/)).not.toBeInTheDocument()
    expect(screen.queryByText(/comments/)).not.toBeInTheDocument()
  })

  it('should call onViewDetails when Read More button is clicked', () => {
    const onViewDetails = vi.fn()
    render(<PostCard post={mockPost} onViewDetails={onViewDetails} />)

    const readMoreButton = screen.getByRole('button', { name: 'Read More' })
    fireEvent.click(readMoreButton)

    expect(onViewDetails).toHaveBeenCalledWith(1)
  })

  it('should call onPrefetch when card is hovered', () => {
    const onPrefetch = vi.fn()
    render(<PostCard post={mockPost} onPrefetch={onPrefetch} />)

    // Find the card by its class instead of onMouseEnter attribute
    const card = screen.getByText('Test Post Title').closest('.transition-shadow')
    expect(card).toBeInTheDocument()
    
    if (card) {
      fireEvent.mouseEnter(card)
      expect(onPrefetch).toHaveBeenCalledWith(1)
    }
  })

  it('should truncate long titles and body text', () => {
    const longPost: Post = {
      id: 3,
      title: 'This is a very long title that should be truncated when it exceeds the maximum length allowed for display',
      body: 'This is a very long body content that should be truncated when it exceeds the maximum length allowed for display in the card component. It should show only a preview of the content.',
      userId: 1,
    }

    render(<PostCard post={longPost} />)

    const titleElement = screen.getByText(/This is a very long title/)
    const bodyElement = screen.getByText(/This is a very long body content/)

    expect(titleElement).toHaveClass('line-clamp-2')
    expect(bodyElement).toHaveClass('line-clamp-3')
  })

  it('should handle missing callbacks gracefully', () => {
    render(<PostCard post={mockPost} />)

    const readMoreButton = screen.getByRole('button', { name: 'Read More' })
    const card = screen.getByText('Test Post Title').closest('[onMouseEnter]')

    // Should not throw errors when callbacks are not provided
    expect(() => {
      fireEvent.click(readMoreButton)
      if (card) fireEvent.mouseEnter(card)
    }).not.toThrow()
  })
})