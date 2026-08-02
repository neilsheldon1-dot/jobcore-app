import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(
            ({ name, value, options }) =>
              response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isLoginPage = pathname === '/login'
  const isApiRoute = pathname.startsWith('/api')

  if (!user && !isLoginPage) {
    return NextResponse.redirect(
      new URL('/login', request.url)
    )
  }

  if (!user) {
    return response
  }

  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

  if (profileError) {
    console.error(
      'Middleware profile lookup error:',
      profileError
    )
  }

  const isFitter = profile?.role === 'fitter'

  if (isLoginPage) {
    return NextResponse.redirect(
      new URL(isFitter ? '/my-jobs' : '/', request.url)
    )
  }

  if (
    isFitter &&
    !isApiRoute &&
    !pathname.startsWith('/my-jobs')
  ) {
    return NextResponse.redirect(
      new URL('/my-jobs', request.url)
    )
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}