import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'


type SearchBarProps = {
  value: string
  onSearch: (query: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  showClearButton?: boolean
  disabled?: boolean
}

export const SearchBar = ({
  value,
  onSearch,
  onClear,
  placeholder = 'Search posts...',
  className = '',
  showClearButton = true,
  disabled = false,
}: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onSearch(newValue)
  }, [onSearch])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onSearch('')
    onClear?.()
  }, [onSearch, onClear])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
          aria-label="Search posts"
        />
        {showClearButton && localValue && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export default SearchBar