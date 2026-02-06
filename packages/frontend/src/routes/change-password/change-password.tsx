import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import { useChangePassword } from '@/hooks/api'
import { isApiError } from '@/lib/is-fetch-error'
import z from 'zod'
import { passwordSchema } from '@/lib/zod'
import { zodResolver } from '@hookform/resolvers/zod'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current Password is required'),
    newPassword: passwordSchema('New Password'),
    confirmPassword: passwordSchema('Confirm Password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export function ChangePassword() {
  const navigate = useNavigate()
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(2)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const { mutateAsync, isPending } = useChangePassword()

  useEffect(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showSuccess && countdown === 0) {
      void navigate('/')
    }
  }, [showSuccess, countdown, navigate])

  const onSubmit = async (data: ChangePasswordFormData) => {
    await mutateAsync(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setShowSuccess(true)
        },
        onError: (error) => {
          if (isApiError(error)) {
            if (error.status === 429) {
              setError('root', {
                type: 'manual',
                message:
                  'Too many password change attempts. Please try again in 15 minutes.',
              })
            } else {
              setError('root', {
                type: 'manual',
                message: error.message,
              })
            }
          } else {
            setError('root', {
              type: 'manual',
              message:
                'Network error. Please check your connection and try again.',
            })
          }
        },
      },
    )
  }

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-600">
            Success!
          </CardTitle>
          <CardDescription>
            Your password has been changed successfully
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md text-center">
            <p className="mb-2">Password changed successfully</p>
            <p className="text-sm">
              Redirecting to dashboard in {countdown}...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
        <CardDescription>
          Enter your current password and choose a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Field data-invalid={!!errors.currentPassword}>
              <FieldLabel htmlFor="currentPassword">
                Current Password
              </FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                {...register('currentPassword')}
              />
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter your new password"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                {...register('newPassword')}
              />
              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
          </FieldGroup>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Changing Password...' : 'Change Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
