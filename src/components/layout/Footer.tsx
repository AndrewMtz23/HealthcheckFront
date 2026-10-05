import Link from 'next/link';
import Image from 'next/image';
import BrandWordmark from './BrandWordmark';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pb-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
              <Image src="/Images/logoHC.png" alt="" width={640} height={449} className="h-auto w-10 shrink-0" />
              <span className="font-bold text-lg"><BrandWordmark /></span>
            </Link>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SMART LINK. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center xl:justify-end">
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
