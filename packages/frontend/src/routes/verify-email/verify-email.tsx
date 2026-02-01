import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useVerifyEmail, useResendVerification } from '@/hooks/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const {
    mutate: verifyEmail,
    isPending,
    isSuccess,
    isError,
    error,
  } = useVerifyEmail()

  const {
    mutate: resendVerification,
    isPending: isResending,
    isSuccess: isResendSuccess,
  } = useResendVerification()

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token, verifyEmail])

  const handleResend = (email: string) => {
    resendVerification(email)
  }

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>No Verification Token</CardTitle>
          <CardDescription>
            No verification token was provided in the URL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            If you need a new verification email, please enter your email below.
          </p>
          <ResendVerificationForm
            onResend={handleResend}
            isPending={isResending}
            isSuccess={isResendSuccess}
          />
        </CardContent>
      </Card>
    )
  }

  if (isPending) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying your email...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-green-600">
            Email Verified Successfully!
          </CardTitle>
          <CardDescription>
            Your email has been verified. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => void navigate('/signin')} className="w-full">
            Go to Sign In
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    const isExpired =
      error.message?.includes('expired') || error.message?.includes('Invalid')

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">Verification Failed</CardTitle>
          <CardDescription>
            {isExpired
              ? 'This verification link has expired or is invalid.'
              : error.message || 'Unable to verify your email.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {isExpired
              ? 'Verification links expire after 15 minutes. You can request a new verification email below.'
              : 'Please check your connection and try again, or request a new verification email.'}
          </p>
          <ResendVerificationForm
            onResend={handleResend}
            isPending={isResending}
            isSuccess={isResendSuccess}
          />
        </CardContent>
      </Card>
    )
  }

  return null
}

function ResendVerificationForm({
  onResend,
  isPending,
  isSuccess,
}: {
  onResend: (email: string) => void
  isPending: boolean
  isSuccess: boolean
}) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      onResend(email)
    }
  }

  if (isSuccess) {
    return (
      <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm text-center">
        Verification email sent! Please check your inbox.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="resend-email">Email Address</FieldLabel>
        <Input
          id="resend-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isPending}
        />
      </Field>
      <Button type="submit" disabled={isPending || !email} className="w-full">
        {isPending ? 'Sending...' : 'Resend Verification Email'}
      </Button>
    </form>
  )
}
