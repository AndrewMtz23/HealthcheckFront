export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      // Este layout específico para la sección de autenticación
      // En este caso, no incluimos el Navbar ni el Footer
      <div className="bg-gray-50 min-h-screen">
        {children}
      </div>
    );
  }