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
        window.location.href = '/' // Force reload to trigger middleware redirection
      }
    } catch (e: any) {
      setGlobalError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex lg:w-[52%] bg-surface-warm p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              {process.env.NEXT_PUBLIC_ORG_NAME || 'PROIN'}
            </span>
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl lg:text-7xl font-semibold tracking-tight leading-[0.95] mb-8 text-text-primary">
            Asset<br />Management<br /><span className="text-text-tertiary">System</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-sm">
            Professional inventory tracking for AV equipment. Track, manage, and deploy across your organization.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-between text-xs text-text-tertiary font-medium">
          <span>© Copyright {new Date().getFullYear()} | {process.env.NEXT_PUBLIC_ORG_COMPANY || 'Langpros Language Solutions'}</span>
          <div className="flex gap-6">
            <span>Inventory</span>
            <span>Projects</span>
            <span>Deployment</span>
          </div>
        </div>

      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-[48%] bg-background flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary mb-3">Sign in</h2>
            <p className="text-text-secondary text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {globalError && (
              <div className="p-3 text-sm text-error bg-[#fef3f2] border border-[#fecdca] rounded-lg">
                {globalError}
              </div>
            )}

            <div className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="name@company.com"
                icon={<Mail className="w-4 h-4" strokeWidth={2.5} />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" strokeWidth={2.5} />}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Continue
            </Button>
            
            <p className="text-center text-[11px] font-medium text-text-placeholder pt-4">
              Secured by Supabase Auth
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
