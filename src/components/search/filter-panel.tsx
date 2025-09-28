import { useState, useCallback } from 'react'
import { Filter, Calendar, MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DatePicker } from '@/components/ui/date-picker'
import { UserSelect } from '@/components/ui/user-select'
import type { SearchFilters } from '@/types'

type FilterPanelProps = {
  filters: SearchFilters
  onFiltersChange: (filters: Partial<SearchFilters>) => void
  onClearFilters: () => void
  className?: string
}

export const FilterPanel = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = '',
}: FilterPanelProps) => {
  const [localCommentRange, setLocalCommentRange] = useState({
    min: filters.commentCountRange?.min?.toString() || '',
    max: filters.commentCountRange?.max?.toString() || '',
  })

  const handleDateRangeChange = useCallback((field: 'start' | 'end', date: Date | undefined) => {
    const currentRange = filters.dateRange || { start: undefined, end: undefined }
    const newRange = { ...currentRange, [field]: date }

    if (newRange.start && newRange.end) {
      onFiltersChange({ dateRange: newRange })
    } else if (!newRange.start && !newRange.end) {
      onFiltersChange({ dateRange: undefined })
    } else {
      onFiltersChange({ dateRange: newRange })
    }
  }, [filters.dateRange, onFiltersChange])

  const handleCommentRangeChange = useCallback((field: 'min' | 'max', value: string) => {
    const newCommentRange = { ...localCommentRange, [field]: value }
    setLocalCommentRange(newCommentRange)

    const min = parseInt(newCommentRange.min, 10)
    const max = parseInt(newCommentRange.max, 10)

    if (!isNaN(min) && !isNaN(max)) {
      onFiltersChange({
        commentCountRange: { min, max },
      })
    } else if (!newCommentRange.min && !newCommentRange.max) {
      onFiltersChange({ commentCountRange: undefined })
    }
  }, [localCommentRange, onFiltersChange])

  const handleUserChange = useCallback((userId: number | undefined) => {
    onFiltersChange({ userId })
  }, [onFiltersChange])

  const handleClearAll = useCallback(() => {
    setLocalCommentRange({ min: '', max: '' })
    onClearFilters()
  }, [onClearFilters])

  const hasActiveFilters = !!(
    filters.dateRange ||
    filters.commentCountRange ||
    filters.userId
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 ${className}`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {[filters.dateRange, filters.commentCountRange, filters.userId].filter(Boolean).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filters
            </h4>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Date Range
            </Label>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">From</Label>
                <DatePicker
                  date={filters.dateRange?.start}
                  onDateChange={(date) => handleDateRangeChange('start', date)}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">To</Label>
                <DatePicker
                  date={filters.dateRange?.end}
                  onDateChange={(date) => handleDateRangeChange('end', date)}
                  placeholder="Select end date"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Comment Count Range Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MessageCircle className="h-4 w-4" />
              Comment Count
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Min</Label>
                <Input
                  type="number"
                  min="0"
                  value={localCommentRange.min}
                  onChange={(e) => handleCommentRangeChange('min', e.target.value)}
                  placeholder="0"
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Max</Label>
                <Input
                  type="number"
                  min="0"
                  value={localCommentRange.max}
                  onChange={(e) => handleCommentRangeChange('max', e.target.value)}
                  placeholder="100"
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* User Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <User className="h-4 w-4" />
              User
            </Label>
            <UserSelect
              value={filters.userId}
              onValueChange={handleUserChange}
              placeholder="Select user..."
              className="w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default FilterPanel