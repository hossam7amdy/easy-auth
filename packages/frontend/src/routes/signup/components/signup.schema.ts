import { z } from 'zod'

export const signupSchema = z.object({
  email: z.email('Please provide a valid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character',
    ),
})

export type SignupFormData = z.infer<typeof signupSchema>
