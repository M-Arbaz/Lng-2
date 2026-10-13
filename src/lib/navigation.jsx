'use client'

import NextLink from 'next/link'
import { useParams as useNextParams, usePathname, useRouter } from 'next/navigation'

/**
 * Small compatibility layer used while preserving the original component APIs.
 * Routing itself is 100% Next.js App Router (next/link + next/navigation).
 */
export function Link({ to, href, children, ...props }) {
  return <NextLink href={href ?? to ?? '/'} {...props}>{children}</NextLink>
}

export function useNavigate() {
  const router = useRouter()
  return (target, options = {}) => {
    if (typeof target === 'number') {
      if (target < 0) router.back()
      else if (target === 0) router.refresh()
      else router.forward()
      return
    }
    if (options?.replace) router.replace(target)
    else router.push(target)
  }
}

export function useLocation() {
  const pathname = usePathname()
  return { pathname }
}

export function useParams() {
  return useNextParams()
}
