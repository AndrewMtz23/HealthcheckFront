import Link from 'next/link';
import { FiMail, FiFlag, FiShield } from 'react-icons/fi';

export default function ContactContent() {
  const configuredEmail = process.env.HEALTHCHECK_CONTACT_EMAIL?.trim();
  const email = configuredEmail && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(configuredEmail) ? configuredEmail : null;

  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <FiMail aria-hidden="true" className="mb-5 h-14 w-14 rounded-2xl bg-blue-50 p-3 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900">Consultas generales</h2>
        {email ? (
          <>
            <p className="mt-4 leading-7 text-gray-600">Describe tu consulta e incluye el enlace de la página relacionada. No compartas contraseñas ni datos médicos personales.</p>
            <a href={`mailto:${email}`} className="mt-6 inline-flex min-h-11 max-w-full items-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">{email}</a>
            <p className="mt-3 text-sm text-gray-500">Se abrirá tu aplicación de correo.</p>
          </>
        ) : (
          <p className="mt-4 leading-7 text-gray-600">El canal de contacto directo aún no está disponible. Para señalar información que requiera revisión, utiliza la opción de reportar una fuente en el detalle de una noticia.</p>
        )}
      </div>
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <FiFlag aria-hidden="true" className="mb-4 h-12 w-12 rounded-xl bg-blue-100 p-3 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Reportar una fuente</h2>
          <p className="mt-3 leading-7 text-gray-600">Abre una noticia, localiza su fuente y selecciona la opción de reporte. Inicia sesión si la plataforma te lo solicita.</p>
          <Link href="/news" className="mt-4 inline-flex min-h-11 items-center font-semibold text-blue-700 hover:underline">Ir a las noticias →</Link>
        </div>
        <div className="rounded-2xl bg-blue-50 p-6 sm:p-8">
          <FiShield aria-hidden="true" className="mb-4 h-12 w-12 rounded-xl bg-blue-100 p-3 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Describe el problema con claridad</h2>
          <p className="mt-3 leading-7 text-gray-600">Anota la página, lo que intentabas hacer y el mensaje de error. Si adjuntas una captura en tu correo, oculta cualquier dato personal.</p>
        </div>
      </div>
    </section>
  );
}
