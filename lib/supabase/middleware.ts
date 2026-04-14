import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with cross-browser cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public route access (login page)
  if (path === '/' || path === '/login') {
    if (user) {
      // Find role to redirect appropriate dashboard
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const role = profile?.role || 'TECH'
      
      let redirectPath = '/tech'
      if (role === 'PM') redirectPath = '/pm'
      if (role === 'INV') redirectPath = '/inv'
      if (role === 'ADMIN') redirectPath = '/admin'
      
      const url = request.nextUrl.clone()
      url.pathname = redirectPath
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Protected routes access check
  if (!user) {
    // If not logged in, bounce out
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Get user role for RBAC
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role || 'TECH' // default fallback

  // Enforce Path Scope rules
  if (path.startsWith('/pm') && role !== 'PM' && role !== 'ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }
  
  if (path.startsWith('/inv') && role !== 'INV' && role !== 'ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }
  
  if (path.startsWith('/admin') && role !== 'ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  // Strictly lock /tech to only TECH and ADMIN
  if (path.startsWith('/tech') && role !== 'TECH' && role !== 'ADMIN') {
    const url = request.nextUrl.clone()
    url.pathname = '/unauthorized'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
