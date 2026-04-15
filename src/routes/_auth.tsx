import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { ArrowLeftIcon } from '@phosphor-icons/react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.auth) {
      throw redirect({ to: '/', viewTransition: true })
    }
  },
  component: RouteCompoment,
})

function RouteCompoment() {
  const pathname = useLocation({ select: (state) => state.pathname })

  const title = pathname === '/sign-in' ? 'Sign In' : 'Sign Up'
  const description =
    pathname === '/sign-in' ? 'Welcome back' : 'Create an account'

  return (
    <main className="flex min-h-svh items-center justify-center">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute top-4 left-4"
        asChild
      >
        <Link to="/" viewTransition>
          <ArrowLeftIcon />
        </Link>
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <Outlet />
        </CardContent>

        <CardFooter className="border-none">
          <div className="text-xs text-muted-foreground">
            {pathname === '/sign-in' ? (
              <p>
                Don't have an account?{' '}
                <Button variant="link" size="sm" className="p-0" asChild>
                  <Link to="/sign-up" viewTransition>
                    Sign Up
                  </Link>
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <Button variant="link" size="sm" className="p-0" asChild>
                  <Link to="/sign-in" viewTransition>
                    Sign In
                  </Link>
                </Button>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
