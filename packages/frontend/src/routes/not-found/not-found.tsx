import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'

export function NotFound() {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <CardTitle className="text-4xl font-extrabold text-primary">
          404
        </CardTitle>
        <CardTitle className="text-xl">Page Not Found</CardTitle>
        <CardDescription className="text-lg">
          Oops! The page you're looking for doesn't exist.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center">
        <Button asChild className="w-full sm:w-auto">
          <Link to="/">Go Back Home</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
