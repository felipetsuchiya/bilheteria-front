export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 border-t border-gray-800 mt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Nome do Projeto */}
          <div className="text-2xl font-bold text-white tracking-wider">
            Ko<span className="text-blue-500">yn</span>
          </div>

          {/* Links de Navegação */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="hover:text-blue-400 transition-colors">
              Explorar Eventos
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Como Funciona
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-blue-400 transition-colors">
              Privacidade
            </a>
          </nav>

          {/* Direitos Autorais */}
          <div className="text-sm text-gray-500">
            &copy; {currentYear} KOYN. Todos os direitos reservados.
          </div>
          
        </div>
      </div>
    </footer>
  );
}