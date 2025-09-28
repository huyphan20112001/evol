import { User as UserIcon } from 'lucide-react'
import { useUsers } from '@/hooks/use-users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type UserSelectProps = {
  value?: number
  onValueChange: (value: number | undefined) => void
  placeholder?: string
  className?: string
}

export function UserSelect({
  value,
  onValueChange,
  placeholder = 'Select user...',
  className,
}: UserSelectProps) {
  const { data: users, isLoading, error } = useUsers()

  const handleValueChange = (stringValue: string) => {
    if (stringValue === 'clear') {
      onValueChange(undefined)
    } else {
      onValueChange(parseInt(stringValue, 10))
    }
  }

  const selectedUser = users?.find((user) => user.id === value)

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserIcon className="h-4 w-4" />
        Failed to load users
      </div>
    )
  }

  return (
    <Select
      value={value ? value.toString() : ''}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedUser ? (
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>{selectedUser.name}</span>
              <span className="text-muted-foreground">
                (@{selectedUser.username})
              </span>
            </div>
          ) : (
            placeholder
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {value && (
          <SelectItem value="clear" className="text-muted-foreground">
            Clear selection
          </SelectItem>
        )}
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading users...
          </SelectItem>
        ) : (
          users?.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                <span>{user.name}</span>
                <span className="text-muted-foreground">
                  (@{user.username})
                </span>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
