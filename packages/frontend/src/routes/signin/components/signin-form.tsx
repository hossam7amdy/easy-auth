import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { signinSchema, type SigninFormData } from './signin.schema'
import { ApiError } from '@/lib/fetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { useSignIn, useResendVerification } from '@/hooks/api'

export function SigninForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isUnverified, setIsUnverified] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { mutateAsync, isPending } = useSignIn()
  const {
    mutate: resendVerification,
    isPending: isResending,
    isSuccess: isResendSuccess,
    isError: isResendError,
    error: resendError,
  } = useResendVerification()

  const onSubmit = async (data: SigninFormData) => {
    setIsUnverified(false)
    setUserEmail(data.email)

    await mutateAsync(data, {
      onSuccess: () => {
        void navigate(location.state?.from || '/')
      },
      onError: (error: ApiError) => {
        if (error.status === 403) {
          setIsUnverified(true)
          setError('root', {
            type: 'manual',
            message: 'Please verify your email address before signing in.',
          })
        } else if (error.status === 401) {
          setError('root', {
            type: 'manual',
            message: 'Invalid email or password.',
          })
        } else {
          setError('root', {
            type: 'manual',
            message: error.message || 'Something went wrong. Please try again.',
          })
        }
      },
    })
  }

  const handleResendVerification = () => {
    if (userEmail) {
      resendVerification(userEmail)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.root && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm text-center">
            {errors.root.message}
          </div>
        )}

        {isUnverified && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-3">
              We've sent a verification email to <strong>{userEmail}</strong>.
              If you didn't receive it, you can request a new one.
            </p>
            {isResendSuccess && (
              <div className="mb-3 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                Verification email sent! Please check your inbox.
              </div>
            )}
            {isResendError && (
              <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                {resendError && resendError.status === 429
                  ? 'Too many requests. Please wait a few minutes before trying again.'
                  : 'Failed to send verification email. Please try again.'}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isResending || isResendSuccess}
              className="w-full"
            >
              {isResending
                ? 'Sending...'
                : isResendSuccess
                  ? 'Email Sent!'
                  : 'Resend Verification Email'}
            </Button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e)
          }}
          className="space-y-4"
        >
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="hossam@easy.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <FieldError errors={[errors.password]} />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isSubmitting || isPending}
            className="w-full"
          >
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="underline">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
