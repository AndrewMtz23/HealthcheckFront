import AdminShell from '@/components/admin/AdminShell';
import '@/components/admin/admin.css';
export default function AdminLayout({children}:{children:React.ReactNode}){return <AdminShell>{children}</AdminShell>;}
