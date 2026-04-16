'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/app/login/actions'
import { createClient } from '@/lib/supabase/client'
import useAuthStore from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Mail, Lock } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { setSession, setRole } = useAuthStore()
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setGlobalError(null)

    try {
      const result = await loginUser(data)

      if (!result.success) {
        setGlobalError(result.message || 'An error occurred during login.')
        return
      }

      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setSession(session)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setRole(profile?.role || 'TECH')
        window.location.href = '/'
      }
    } catch (e: any) {
      setGlobalError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-sm flex flex-col items-center text-center mb-12 animate-fade-up">
        <span className="font-display font-semibold text-2xl tracking-tight text-charcoal mb-8">
          {process.env.NEXT_PUBLIC_ORG_NAME || 'PROIN'}
        </span>
        <h1 className="text-4xl font-display font-semibold tracking-tight text-charcoal mb-4">
          Welcome back
        </h1>
        <p className="text-mid-gray text-base">
          Sign in to your account to manage assets.
        </p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-lg border border-border animate-fade-up">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {globalError && (
            <div className="p-4 text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-md">
              {globalError}
            </div>
          )}

          <div className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="name@company.com"
              icon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="size-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            isLoading={isLoading}
          >
            Sign in
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px w-8 bg-border"></div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-mid-gray">
              Auth secure
            </span>
            <div className="h-px w-8 bg-border"></div>
          </div>
        </form>
      </div>

      <footer className="mt-12 text-center text-xs text-mid-gray">
        <span>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_ORG_COMPANY || 'Langpros'}</span>
      </footer>
    </div>
  )
}

