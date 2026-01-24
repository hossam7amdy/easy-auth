import { z } from 'zod'

export const signinSchema = z.object({
  email: z.email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SigninFormData = z.infer<typeof signinSchema>
