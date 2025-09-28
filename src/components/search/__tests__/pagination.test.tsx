import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Pagination } from '../pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render pagination controls correctly', () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
  })

  it('should not render when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination {...defaultProps} totalPages={1} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('should disable Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)

    const previousButton = screen.getByRole('button', { name: /previous/i })
    expect(previousButton).toBeDisabled()
  })

  it('should disable Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />)

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()
  })

  it('should call onPageChange when Previous button is clicked', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />
    )

    const previousButton = screen.getByRole('button', { name: /previous/i })
    fireEvent.click(previousButton)

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should call onPageChange when Next button is clicked', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    expect(onPageChange).toHaveBeenCalledWith(4)
  })

  it('should call onPageChange when page number is clicked', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination {...defaultProps} currentPage={1} onPageChange={onPageChange} />
    )

    const pageButton = screen.getByRole('button', { name: '3' })
    fireEvent.click(pageButton)

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('should highlight current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)

    const currentPageButton = screen.getByRole('button', { name: '3' })
    expect(currentPageButton).not.toHaveClass('variant-outline')
  })

  it('should show ellipsis for large page counts', () => {
    render(
      <Pagination {...defaultProps} currentPage={5} totalPages={10} />
    )

    const ellipses = screen.getAllByText('...')
    expect(ellipses.length).toBeGreaterThan(0)
  })

  it('should disable all buttons when loading', () => {
    render(<Pagination {...defaultProps} isLoading={true} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('should not call onPageChange when buttons are disabled', () => {
    const onPageChange = vi.fn()
    render(
      <Pagination 
        {...defaultProps} 
        currentPage={1} 
        onPageChange={onPageChange}
        isLoading={true}
      />
    )

    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)

    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('should show all pages when total pages is small', () => {
    render(
      <Pagination {...defaultProps} currentPage={2} totalPages={4} />
    )

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
    expect(screen.queryByText('...')).not.toBeInTheDocument()
  })
})