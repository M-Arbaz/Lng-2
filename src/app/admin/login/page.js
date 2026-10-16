import AdminLoginPage from '@/views/AdminLoginPage'
import { createMetadata } from '@/lib/seo'
export const metadata = createMetadata({ title: 'Admin Login', path: '/admin/login', noIndex: true })
export default function Page() { return <AdminLoginPage /> }
