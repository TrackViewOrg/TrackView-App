import { Button, type ButtonProps } from '@/components/ui/button'
import { ReactNode } from 'react'

interface ActionButtonProps extends ButtonProps {
  label: string | ReactNode
}

export const ActionButton = ({
  label,
  className = '',
  ...props
}: ActionButtonProps) => (
  <Button
    size="sm"
    variant="default"
    // Simple string concatenation
    className={`border-border/20 rounded-[3px] border ${className} transition-transform`}
    {...props}
  >
    {label}
  </Button>
)
