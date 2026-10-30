
'use client'

import { useEffect, useState } from 'react'
import isCurrentDomainAllowed from '@/utils/domainAccess'

export default function DomainAccessGuard({ children }) {
    const [isAllowed, setIsAllowed] = useState(null)

    useEffect(() => {
        let active = true

        const checkDomain = async () => {
            try {
                const allowed = await isCurrentDomainAllowed()

                if (active) {
                    setIsAllowed(allowed)
                }
            } catch (error) {
                console.error('Domain verification failed:', error)

                // Fail closed: hide website if verification fails.
                if (active) {
                    setIsAllowed(false)
                }
            }
        }

        checkDomain()

        return () => {
            active = false
        }
    }, [])

    // Unauthorized domain gets an empty page.
    if (isAllowed === false) {
        return null
    }

    return (
        <div
            aria-hidden={isAllowed !== true}
            style={{
                visibility: isAllowed === true ? 'visible' : 'hidden',
                height: isAllowed === true ? 'auto' : 0,
                overflow: isAllowed === true ? 'visible' : 'hidden',
            }}
        >
            {children}
        </div>
    )
}
