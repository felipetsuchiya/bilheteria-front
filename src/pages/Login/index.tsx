import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';


export function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await api.post('/auth/login', {
                email,
                senha
            });

            const { token, usuario } = response.data;

            if (token) {
                localStorage.setItem('@App:token', token);
                localStorage.setItem('@App:usuario', JSON.stringify(usuario));

                // Dispara o evento avisando a Navbar que os dados mudaram
                window.dispatchEvent(new Event('authChange'));
            }

            if (usuario.tipo === 'organizacao') {
                navigate('/dashboard');
            } else if (usuario.tipo === 'cliente') {
                navigate('/');
            }

        } catch (error: any) {
            console.error('Erro no login:', error);

            if (error.response && error.response.status === 401) {
                setErrorMessage('E-mail ou senha incorretos.');
            } else if (error.response?.data?.mensagem) {
                // Captura a mensagem de erro vinda do Flask se houver
                setErrorMessage(error.response.data.mensagem);
            } else {
                setErrorMessage('Erro ao tentar fazer login. Tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <div className="bg-[#0c1b35] p-10 rounded-[30px] w-full max-w-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-900/40 rounded-full blur-2xl opacity-80"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-900/30 rounded-full blur-xl opacity-70"></div>

                <div className="flex flex-col items-center gap-8 z-10 relative">
                    <div className="flex items-center text-2xl font-bold">
                        <span className="text-white">Ko</span>
                        <span className="text-sky-400">ym</span>
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                            ENTRE NA <span className="text-sky-400">SUA CONTA</span>
                        </h1>
                        <p className="text-slate-300 text-base max-w-[280px] mx-auto">
                            Acesse seus ingressos exclusivos e eventos globais com NFT.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="w-full p-3 bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg text-center">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-200">
                                Endereço de E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seu.email@exemplo.com"
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-5 py-4 text-white text-base placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-slate-200">
                                    Senha
                                </label>
                                <a href="#" className="text-sm font-medium text-sky-400 hover:text-sky-300">
                                    Esqueceu a senha?
                                </a>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                placeholder="Sua senha secreta"
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-5 py-4 text-white text-base placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-4 rounded-xl text-lg transition duration-150 ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-[#0d59f7] hover:bg-[#0047e0]'
                                }`}
                        >
                            {isLoading ? 'ENTRANDO...' : 'LOGIN NA CONTA'}
                        </button>
                    </form>

                    <div className="text-center w-full mt-4 flex flex-col items-center gap-4">
                        <span className="text-slate-400">Não tem uma conta?</span>
                        <button
                            onClick={() => navigate('/cadastro/cliente')}
                            type="button"
                            className="w-full border-2 border-slate-600 hover:border-slate-500 text-sky-400 font-semibold py-3 rounded-xl text-base transition duration-150"
                        >
                            CRIAR NOVA CONTA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}