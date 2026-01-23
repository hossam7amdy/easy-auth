import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import type { SignUpRequest, SignUpResponse } from '@easy-auth/shared'

import { signupSchema, type SignupFormData } from '@/lib/schemas'
import { callEndpoint, ApiError } from '@/lib/fetch'
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

export function SignupForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
  })

  const signupMutation = useMutation({
    mutationFn: (data: SignUpRequest) =>
      callEndpoint<SignUpRequest, SignUpResponse>(
        ENDPOINT_CONFIGS.signup,
        data,
      ),
    onSuccess: (response) => {
      setSuccessMessage(
        `Welcome, ${response.data.user.name}! Your account has been created.`,
      )
      reset()
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        setError('email', {
          type: 'manual',
          message:
            'This email is already registered. Please use a different email or sign in.',
        })
      } else {
        setError('root', {
          type: 'manual',
          message: error.message || 'Something went wrong. Please try again.',
        })
      }
    },
  })

  const onSubmit = (data: SignupFormData) => {
    setSuccessMessage(null)
    signupMutation.mutate(data)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm text-center">
            {successMessage}
          </div>
        )}

        {errors.root && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm text-center">
            {errors.root.message}
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

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Hossam Hamdy"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              <FieldError errors={[errors.password]} />
              <p className="text-[0.8rem] text-muted-foreground">
                Min 8 characters with letter, number, and special character
              </p>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isSubmitting || signupMutation.isPending}
            className="w-full"
          >
            {signupMutation.isPending
              ? 'Creating account...'
              : 'Create Account'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="#" className="underline">
            Sign in
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
