import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import { SignOutButton } from '@/components/ui/SignOutButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-surface-warm flex flex-col items-center pt-6 px-4 pb-12 font-sans">
      {/* Floating Glass Pill Navbar */}
      <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="bg-white/60 backdrop-blur-md border border-white/50 rounded-full px-5 py-3 flex items-center gap-6 w-max transition-all">
          
          {/* Logo (Hidden on mobile) */}
          <Link href="/" className="hidden sm:flex flex-shrink-0 items-center cursor-pointer group">
            <span className="font-semibold text-sm tracking-tight text-text-primary group-hover:opacity-80 transition-opacity">
              {process.env.NEXT_PUBLIC_ORG_NAME || 'PROIN'} {process.env.NEXT_PUBLIC_APP_NAME || ''}
            </span>
          </Link>

          <div className="hidden sm:block w-px h-4 bg-border-focus"></div>

          {/* Right Side Items (Always visible, Email + Sign Out) */}
          <div className="flex items-center justify-between gap-6">
            <span className="text-[13px] font-medium text-text-secondary max-w-[160px] truncate sm:max-w-none">
              {user?.email}
            </span>

            <div className="w-px h-4 bg-border-focus opacity-50"></div>
            
            <form action={signOut}>
              <SignOutButton />
            </form>
          </div>
          
        </nav>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto pt-28">
        {children}
      </main>
    </div>
  )
}
