import { type ReactNode } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { cn } from '#/lib/utils'

export const SettingsCustomCard = ({
  icon,
  title,
  description,
  children,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
  className?: string
}) => {
  return (
    <Card
      className={cn('border border-dashed border-border ring-0', className)}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </div>

        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  )
}
