import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api'; // Não se esqueça de importar a API!

export function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // 1. Criamos um estado para o usuário
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    // 2. Usamos o useEffect para carregar o usuário e escutar o evento de login/logout
    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('@App:usuario');
            setUser(userStr ? JSON.parse(userStr) : null);
        };

        // Carrega o usuário quando a Navbar renderiza a primeira vez
        loadUser();

        // Fica "escutando" o evento customizado que vamos disparar do Login
        window.addEventListener('authChange', loadUser);

        return () => {
            window.removeEventListener('authChange', loadUser);
        };
    }, []);

    // 3. Atualizamos o handleLogout para fazer a requisição na API
    const handleLogout = async () => {
        try {
            // Se a sua blueprint 'auth_bp' tiver um prefixo '/auth', a rota será '/auth/logout'
            // Caso contrário, ajuste apenas para '/logout'
            await api.post('/auth/logout');
            console.log('Logout realizado no backend com sucesso.');
        } catch (error) {
            console.error('Erro ao comunicar logout ao backend:', error);
        } finally {
            // O finally garante que, mesmo se a API falhar, o usuário será deslogado no frontend
            localStorage.removeItem('@App:token');
            localStorage.removeItem('@App:usuario');
            setIsDropdownOpen(false);

            // Dispara o aviso para a Navbar saber que o usuário saiu
            window.dispatchEvent(new Event('authChange'));

            navigate('/login');
        }
    };

    const initial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';

    return (
        <nav className="bg-[#0c1b35] border-b border-slate-800 text-white py-4 px-6 relative z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                <Link to="/" className="flex items-center text-2xl font-bold">
                    <span className="text-white">Ko</span>
                    <span className="text-sky-400">ym</span>
                </Link>

                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
                    <Link to="/cadastro/organizacao" className="hover:text-sky-400 transition-colors">Quero vender com a Koym</Link>
                </div>

                <div>
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-[#16274a] p-2 rounded-xl transition-colors focus:outline-none"
                            >
                                <div className="w-10 h-10 rounded-full bg-linear-to-tr from-sky-500 to-purple-600 flex items-center justify-center font-bold shadow-md">
                                    {initial}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-bold text-white leading-tight">{user.nome}</p>
                                    <p className="text-xs text-sky-400 font-medium capitalize">{user.tipo}</p>
                                </div>

                                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-[#16274a] rounded-xl shadow-2xl border border-slate-700/50 py-2 overflow-hidden">
                                    <Link
                                        to={user.tipo === 'organizacao' ? '/dashboard' : '/minha-conta'}
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="block px-4 py-2.5 text-sm text-slate-200 hover:bg-[#0c1b35] hover:text-sky-400 transition-colors"
                                    >
                                        {user.tipo === 'organizacao' ? 'Painel de Controle' : 'Meus Ingressos'}
                                    </Link>

                                    <div className="h-px bg-slate-700/50 my-1"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-[#0c1b35] transition-colors"
                                    >
                                        Sair da Conta
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-white transition-colors py-2">
                                Entrar
                            </Link>
                            <Link to="/cadastro/cliente" className="bg-[#0d59f7] hover:bg-[#0047e0] text-white text-sm font-semibold py-2 px-5 rounded-lg transition-colors shadow-lg">
                                Cadastrar
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </nav>
    );
}