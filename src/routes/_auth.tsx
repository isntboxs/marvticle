import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
} from '@tanstack/react-router'
import { ArrowLeftIcon } from '@phosphor-icons/react'
import { z } from 'zod'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { SocialSignInButtons } from '#/components/social-sign-in-buttons'

const authSearchSchema = z.object({
  redirect_to: z.string().optional(),
})

export const Route = createFileRoute('/_auth')({
  validateSearch: authSearchSchema,
  beforeLoad: ({ context, search }) => {
    const redirectTo =
      search.redirect_to?.startsWith('/') &&
      !search.redirect_to.startsWith('//')
        ? search.redirect_to
        : '/'

    if (context.auth) {
      throw redirect({ to: redirectTo, viewTransition: true })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const pathname = useLocation({ select: (state) => state.pathname })
  const search = Route.useSearch()

  const isSignInorSignUp = pathname === '/sign-in' || pathname === '/sign-up'
  const isForgotPassword = pathname === '/forgot-password'
  const isResetPassword = pathname === '/reset-password'

  const title = isSignInorSignUp
    ? pathname === '/sign-in'
      ? 'Sign In'
      : 'Sign Up'
    : isForgotPassword
      ? 'Forgot Password'
      : 'Reset Password'

  const description = isSignInorSignUp
    ? pathname === '/sign-in'
      ? 'Enter your username below to login to your account'
      : 'Create an account'
    : isForgotPassword
      ? 'Enter your email below to reset your password'
      : 'Enter your new password below'

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-y-4 px-4">
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

      <Card className="w-full max-w-md gap-0">
        <CardHeader>
          <CardTitle className="font-heading text-xl font-semibold">
            {title}
          </CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>

        <CardContent className="mt-6">
          <Outlet />

          {!isForgotPassword && !isResetPassword && (
            <>
              <div className="my-6 flex w-full items-center justify-between gap-x-2">
                <Separator className="flex-1" />
                <span className="text-muted-foreground">or continue with</span>
                <Separator className="flex-1" />
              </div>

              <SocialSignInButtons />
            </>
          )}
        </CardContent>

        <CardFooter className="border-none px-4">
          {!isForgotPassword && !isResetPassword ? (
            <div className="flex w-full items-center justify-center text-sm text-muted-foreground">
              {isSignInorSignUp && pathname === '/sign-in' ? (
                <p>
                  Don't have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0"
                    asChild
                  >
                    <Link to="/sign-up" search={search} viewTransition>
                      Sign Up
                    </Link>
                  </Button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0"
                    asChild
                  >
                    <Link to="/sign-in" search={search} viewTransition>
                      Sign In
                    </Link>
                  </Button>
                </p>
              )}
            </div>
          ) : (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="w-full p-0 text-center"
              asChild
            >
              <Link to="/sign-in" search={search} viewTransition>
                Back to Sign In
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {!isForgotPassword && !isResetPassword && (
        <p className="text-center text-xs text-muted-foreground">
          By signing {isSignInorSignUp && pathname === '/sign-in' ? 'in' : 'up'}
          , you agree to the{' '}
          <Link
            to="."
            className="font-medium text-primary hover:underline hover:underline-offset-4"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            to="."
            className="font-medium text-primary hover:underline hover:underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </main>
  )
}
