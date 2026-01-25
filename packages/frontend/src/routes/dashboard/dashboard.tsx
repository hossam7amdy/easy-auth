import { useNavigate } from 'react-router-dom'
import { useGetCurrentUser, useSignOut } from '@/hooks/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export function Dashboard() {
  const navigate = useNavigate()
  const { data: user, isLoading, error, refetch } = useGetCurrentUser()
  const { mutate } = useSignOut()

  const handleLogout = () => {
    mutate(undefined, {
      onSuccess: () => {
        void navigate('/signin')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-lg">Loading profile...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-red-500">
          Error loading profile: {error.message}
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
        <CardDescription>You are successfully logged in.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-slate-50 rounded-lg">
          <p className="text-sm text-slate-500 mb-1">Signed in as:</p>
          <p className="font-medium text-lg">{user?.name}</p>
          <p className="text-sm text-slate-600">{user?.email}</p>
        </div>
        <p className="text-center text-slate-600">
          Welcome to the application.
        </p>
      </CardContent>
      <CardFooter className="flex">
        <Button onClick={handleLogout} variant="outline" className="flex-1">
          Sign Out
        </Button>
        <Button onClick={() => void refetch()} className="flex-1">
          Refetch
        </Button>
      </CardFooter>
    </Card>
  )
}
