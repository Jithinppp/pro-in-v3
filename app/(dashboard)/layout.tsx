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
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Clean Minimal Navbar */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display font-semibold text-xl tracking-tight text-charcoal group-hover:opacity-80 transition-opacity">
                {process.env.NEXT_PUBLIC_ORG_NAME || 'PROIN'}
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/inv/assets" className="text-sm font-medium text-mid-gray hover:text-charcoal transition-colors">Assets</Link>
              <Link href="/inv/catalog" className="text-sm font-medium text-mid-gray hover:text-charcoal transition-colors">Catalog</Link>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-charcoal">{user?.email?.split('@')[0]}</span>
              <span className="text-[10px] text-mid-gray truncate max-w-[120px]">{user?.email}</span>
            </div>
            
            <div className="w-px h-6 bg-border"></div>
            
            <form action={signOut}>
              <SignOutButton />
            </form>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}

