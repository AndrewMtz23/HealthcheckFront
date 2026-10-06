import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export default function AdminFooter() {
    return <footer className="a-footer">
        <div><strong>HealthCheck</strong><span>© {new Date().getFullYear()}</span><span className="a-footer-context"><ShieldCheck size={14} aria-hidden="true"/>Panel administrativo</span></div>
        <nav aria-label="Enlaces del pie administrativo"><Link href="/profile">Mi perfil</Link><Link href="/">Ir al sitio público <ArrowUpRight size={14} aria-hidden="true"/></Link></nav>
    </footer>;
}
