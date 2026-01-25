import { Link, Navigate, useLocation, useRouteError } from 'react-router-dom'
import { CircleAlert } from 'lucide-react'
import { isApiError } from '@/lib/is-fetch-error'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'

export const ErrorBoundary = () => {
  const error = useRouteError()
  const location = useLocation()

  let code: number | null = null

  if (isApiError(error)) {
    if (error.status === 401) {
      return <Navigate to="/signin" state={{ from: location }} replace />
    }

    code = error.status ?? null
  }

  /**
   * Log error in development mode.
   *
   * react-router-dom will sometimes swallow the error,
   * so this ensures that we always log it.
   */
  if (import.meta.env.DEV) {
    console.error(error)
  }

  let title: string
  let message: string

  switch (code) {
    case 400:
      title = 'Bad Request'
      message = 'Invalid request, please try again.'
      break
    case 404:
      title = 'Not Found'
      message = 'The page you are looking for does not exist.'
      break
    case 500:
      title = 'Internal Server Error'
      message = 'Something went wrong at our end. Please try again later.'
      break
    default:
      title = 'Something went wrong'
      message = 'An unexpected error occurred. Please try again.'
      break
  }

  return (
    <Card className="w-full max-w-md mx-auto text-center border-destructive/20 shadow-lg">
      <CardHeader>
        <div className="flex justify-center mb-4">
          {code ? (
            <CardTitle className="text-6xl font-extrabold text-destructive">
              {code}
            </CardTitle>
          ) : (
            <CircleAlert className="size-16 text-destructive" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription className="text-lg mt-2">{message}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/">Go Back Home</Link>
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto"
        >
          Try Again
        </Button>
      </CardFooter>
    </Card>
  )
}
