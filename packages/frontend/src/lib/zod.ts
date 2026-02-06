import z from 'zod'

export const passwordSchema = (fieldName = 'Password') =>
  z
    .string()
    .min(1, `${fieldName} is required`)
    .min(8, `${fieldName} must be at least 8 characters long`)
    .regex(/[a-zA-Z]/, `${fieldName} must contain at least one letter`)
    .regex(/\d/, `${fieldName} must contain at least one number`)
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      `${fieldName} must contain at least one special character`,
    )
