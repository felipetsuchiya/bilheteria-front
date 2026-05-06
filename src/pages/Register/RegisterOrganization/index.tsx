import React, { useState } from 'react';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export function RegisterOrganization() {
    // Estado unificado para os dados do Admin e da Organização
    const [formData, setFormData] = useState({
        nomeAdmin: '',
        cpfAdmin: '',
        emailAdmin: '',
        senhaAdmin: '',
        nomeOrg: '',
        cnpjOrg: '',
        acessoEthereumOrg: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        // Montando o payload exatamente no formato exigido pela rota
        const payload = {
            usuario: {
                nome: formData.nomeAdmin,
                cpf: formData.cpfAdmin,
                email: formData.emailAdmin,
                senha: formData.senhaAdmin
            },
            organizacao: {
                nome: formData.nomeOrg,
                cnpj: formData.cnpjOrg,
                acesso_ethereum: formData.acessoEthereumOrg
            }
        };

        try {
            // Chamada para a rota do Flask
            const response = await api.post('/auth/register-organizacao', payload);

            console.log('Organização registrada com sucesso:', response.data);
            alert('Conta de organização criada com sucesso!');
            navigate('/login')

        } catch (error: any) {
            console.error('Erro ao integrar com a API Flask:', error);

            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Erro ao criar conta. Verifique os dados e tente novamente.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 py-12">
            <div className="bg-[#0c1b35] p-8 md:p-10 rounded-[30px] w-full max-w-lg shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-sky-900/30 rounded-full blur-2xl opacity-70"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-900/30 rounded-full blur-2xl opacity-70"></div>

                <div className="z-10 relative">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                            CRIAR CONTA <span className="text-sky-400">ORGANIZAÇÃO</span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Venda ingressos e gerencie seus eventos.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg text-center">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        {/* --- DADOS DA ORGANIZAÇÃO --- */}
                        <div className="border-b border-slate-700/50 pb-4 mb-2">
                            <h2 className="text-sky-400 font-semibold mb-4 text-sm tracking-wider">DADOS DA EMPRESA</h2>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">Nome da Empresa / Produtora</label>
                                    <input
                                        type="text"
                                        name="nomeOrg"
                                        value={formData.nomeOrg}
                                        onChange={handleChange}
                                        required
                                        placeholder="Eventos Top LTDA"
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">CNPJ</label>
                                    <input
                                        type="text"
                                        name="cnpjOrg"
                                        value={formData.cnpjOrg}
                                        onChange={handleChange}
                                        required
                                        placeholder="00.000.000/0001-00"
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">Acesso Ethereum (Carteira)</label>
                                    <input
                                        type="text"
                                        name="acessoEthereumOrg"
                                        value={formData.acessoEthereumOrg}
                                        onChange={handleChange}
                                        required
                                        placeholder="0x..."
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* --- DADOS DO USUÁRIO ADMIN --- */}
                        <div>
                            <h2 className="text-sky-400 font-semibold mb-4 text-sm tracking-wider">DADOS DO ADMINISTRADOR</h2>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">Nome do Responsável</label>
                                    <input
                                        type="text"
                                        name="nomeAdmin"
                                        value={formData.nomeAdmin}
                                        onChange={handleChange}
                                        required
                                        placeholder="Seu nome completo"
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">CPF do Responsável</label>
                                    <input
                                        type="text"
                                        name="cpfAdmin"
                                        value={formData.cpfAdmin}
                                        onChange={handleChange}
                                        required
                                        placeholder="000.000.000-00"
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">E-mail</label>
                                    <input
                                        type="email"
                                        name="emailAdmin"
                                        value={formData.emailAdmin}
                                        onChange={handleChange}
                                        required
                                        placeholder="admin@empresa.com"
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-300">Senha</label>
                                    <input
                                        type="password"
                                        name="senhaAdmin"
                                        value={formData.senhaAdmin}
                                        onChange={handleChange}
                                        required
                                        placeholder="Crie uma senha forte"
                                        className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-4 rounded-xl text-lg transition duration-150 mt-4 ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-[#0d59f7] hover:bg-[#0047e0]'
                                }`}
                        >
                            {isLoading ? 'ENVIANDO...' : 'CRIAR CONTA ORGANIZADOR'}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <span className="text-slate-400 text-sm">Já tem uma conta? </span>
                        <a href="/login" className="text-sky-400 font-semibold hover:text-sky-300 transition-colors">
                            Fazer Login
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}