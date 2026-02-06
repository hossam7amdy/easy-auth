import { passwordSchema } from '@/lib/zod'
import { z } from 'zod'

export const signupSchema = z.object({
  email: z.email('Please provide a valid email address'),
  name: z
    .string()
    .min(1, 'Name is required')
    .min(3, 'Name must be at least 3 characters long'),
  password: passwordSchema(),
})

export type SignupFormData = z.infer<typeof signupSchema>
