import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="text-gray-500 hover:text-blue-600">
              <span className="font-bold text-lg">HealthCheck</span>
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SMART LINK. Todos los derechos reservados.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-6 justify-center md:justify-end">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-blue-600">
              Política de privacidad
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-blue-600">
              Términos y condiciones
            </Link>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-blue-600">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;