import React, { useState } from 'react';
import { api } from '../../../services/api';

export function RegisterClient() {
    // Mantemos o estado plano para facilitar a manipulação dos inputs
    const [formData, setFormData] = useState({
        nome: '',
        cpf: '',
        telefone: '',
        email: '',
        senha: '',
        acessoEthereum: '',
        cep: '',
        rua: '',
        numero: '',
        cidade: '',
        estado: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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

        // Montando o payload exatamente como o Flask espera
        const payload = {
            nome: formData.nome,
            cpf: formData.cpf,
            email: formData.email,
            senha: formData.senha,
            telefone: formData.telefone,
            acesso_ethereum: formData.acessoEthereum, // Mapeando para snake_case
            endereco: {
                rua: formData.rua,
                numero: Number(formData.numero), // Convertendo para número conforme seu exemplo
                cidade: formData.cidade,
                estado: formData.estado,
                cep: formData.cep
            }
        };

        try {
            const response = await api.post('/auth/register-cliente', payload);
            console.log('Cliente criado com sucesso:', response.data);
            alert('Conta criada com sucesso!');

        } catch (error: any) {
            console.error('Erro na integração:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Erro ao criar conta. Verifique a estrutura dos dados.');
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
                            CRIAR CONTA <span className="text-sky-400">CLIENTE</span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Cadastre-se para gerenciar seus ingressos NFT.
                        </p>
                    </div>

                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg text-center">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Nome Completo</label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">CPF</label>
                                <input
                                    type="text"
                                    name="cpf"
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Telefone</label>
                                <input
                                    type="tel"
                                    name="telefone"
                                    value={formData.telefone}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Senha</label>
                            <input
                                type="password"
                                name="senha"
                                value={formData.senha}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Acesso Ethereum</label>
                            <input
                                type="text"
                                name="acessoEthereum"
                                value={formData.acessoEthereum}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">CEP</label>
                            <input
                                type="text"
                                name="cep"
                                value={formData.cep}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Rua</label>
                            <input
                                type="text"
                                name="rua"
                                value={formData.rua}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Número</label>
                                <input
                                    type="text"
                                    name="numero"
                                    value={formData.numero}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-300">Estado</label>
                                <input
                                    type="text"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300">Cidade</label>
                            <input
                                type="text"
                                name="cidade"
                                value={formData.cidade}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#16274a] border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-4 rounded-xl text-lg transition duration-150 mt-4 ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-[#0d59f7] hover:bg-[#0047e0]'
                                }`}
                        >
                            {isLoading ? 'ENVIANDO...' : 'CRIAR CONTA CLIENTE'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}