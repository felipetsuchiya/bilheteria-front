import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useMetaMask } from '../../hooks/useMetaMask';

export function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    const { account, isConnecting, connect } = useMetaMask();

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('@App:usuario');
            setUser(userStr ? JSON.parse(userStr) : null);
        };
        loadUser();
        window.addEventListener('authChange', loadUser);
        return () => window.removeEventListener('authChange', loadUser);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch {}
        finally {
            localStorage.removeItem('@App:token');
            localStorage.removeItem('@App:usuario');
            setIsDropdownOpen(false);
            window.dispatchEvent(new Event('authChange'));
            navigate('/login');
        }
    };

    const saveWallet = async (addr: string) => {
        try {
            await api.patch('/auth/update-wallet', { carteira_ethereum: addr });
        } catch {}
    };

    const handleConnect = async () => {
        const addr = await connect();
        if (addr && isCliente) saveWallet(addr);
    };

    const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
    const initial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';
    const isCliente = user?.tipo === 'cliente';

    return (
        <nav className="bg-[#0c1b35] border-b border-slate-800 text-white py-4 px-6 relative z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                <Link to="/" className="flex items-center text-2xl font-bold">
                    <span className="text-white">Ko</span>
                    <span className="text-sky-400">yn</span>
                </Link>

                <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
                    <Link to="/cadastro/organizacao" className="hover:text-sky-400 transition-colors">
                        Quero vender com a Koyn
                    </Link>
                </div>

                <div className="flex items-center gap-3">

                    {/* Botão MetaMask — só aparece para cliente logado */}
                    {user && isCliente && (
                        account ? (
                            <div className="hidden sm:flex items-center gap-2 bg-[#16274a] border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shrink-0"></span>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                    alt="MetaMask"
                                    className="w-4 h-4"
                                />
                                <span className="text-xs font-mono text-emerald-400 font-semibold">
                                    {shortAddr(account)}
                                </span>
                            </div>
                        ) : (
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="hidden sm:flex items-center gap-2 bg-[#f6851b]/10 hover:bg-[#f6851b]/20 border border-[#f6851b]/40 text-[#f6851b] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                                    alt="MetaMask"
                                    className="w-4 h-4"
                                />
                                {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
                            </button>
                        )
                    )}

                    {/* Área de usuário */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 hover:bg-[#16274a] p-2 rounded-xl transition-colors focus:outline-none"
                            >
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-md">
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
                                <div className="absolute right-0 mt-3 w-52 bg-[#16274a] rounded-xl shadow-2xl border border-slate-700/50 py-2 overflow-hidden">

                                    {/* Wallet no dropdown (mobile) */}
                                    {isCliente && (
                                        <div className="px-4 py-2 border-b border-slate-700/50 mb-1">
                                            {account ? (
                                                <div className="flex items-center gap-2 text-xs text-emerald-400">
                                                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                                    <span className="font-mono">{shortAddr(account)}</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { handleConnect(); setIsDropdownOpen(false); }}
                                                    className="flex items-center gap-2 text-xs text-[#f6851b] font-bold"
                                                >
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-4 h-4" />
                                                    Conectar MetaMask
                                                </button>
                                            )}
                                        </div>
                                    )}

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
                        <div className="flex gap-3">
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
