import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'
import { useTheme } from '#/components/providers/theme-provider'
import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'

export const ThemeToggleSidebar = () => {
  const { theme, setTheme } = useTheme()

  return (
    <ToggleGroup
      type="single"
      size="sm"
      onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
      defaultValue={theme}
      variant="outline"
      spacing={2}
    >
      <ToggleGroupItem value="light" disabled={theme === 'light'}>
        <SunIcon className="size-4" />
        <span className="sr-only">Light</span>
      </ToggleGroupItem>

      <ToggleGroupItem value="dark" disabled={theme === 'dark'}>
        <MoonIcon className="size-4" />
        <span className="sr-only">Dark</span>
      </ToggleGroupItem>

      <ToggleGroupItem value="system" disabled={theme === 'system'}>
        <MonitorIcon className="size-4" />
        <span className="sr-only">System</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
