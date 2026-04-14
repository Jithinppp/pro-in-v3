'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function loginUser(data: z.infer<typeof loginSchema>) {
  // Validate inputs
  const parseResult = loginSchema.safeParse(data)
  
  if (!parseResult.success) {
    return {
      success: false,
      errors: parseResult.error.flatten().fieldErrors,
      message: 'Please fix the errors in the form.',
    }
  }

  const supabase = await createClient()

  // Attempt login
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return {
      success: false,
      message: error.message === 'Invalid login credentials' 
        ? 'Invalid email or password. Please try again.'
        : error.message,
    }
  }

  // Redirect handling is done via middleware.ts when it detects a logged-in user at '/'
  // We can just return success, and the client can refresh or navigate.
  return {
    success: true,
    message: 'Logged in successfully!',
  }
}
