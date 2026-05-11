import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Checkout() {
    const navigate = useNavigate();

    // Simulação de estado de carteira conectada
    const [isWalletConnected, setIsWalletConnected] = useState(false);

    // Dados mockados para demonstração
    const mockOrder = {
        evento: "Dixxxtrava",
        data: "30 de Abril às 22:00h",
        local: "Live - Curitiba, PR",
        precoUnitario: 0.05,
        quantidade: 2,
        taxaGas: 0.0015
    };

    const subtotal = mockOrder.precoUnitario * mockOrder.quantidade;
    const total = subtotal + mockOrder.taxaGas;

    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="max-w-6xl mx-auto px-6">

                {/* Header Simples de Checkout */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0c1b35] mb-8 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Voltar para o evento
                </button>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0c1b35] mb-8 tracking-tight">
                    Finalizar <span className="text-sky-500">Compra</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* COLUNA ESQUERDA: Pagamento e Dados */}
                    <div className="flex-1 flex flex-col gap-8">

                        {/* Passo 1: Carteira Web3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold text-[#0c1b35] mb-2 flex items-center gap-3">
                                <span className="bg-[#0c1b35] text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                                Conectar Carteira
                            </h2>
                            <p className="text-slate-500 mb-6 ml-11">Para receber seu ingresso NFT, conecte sua carteira digital.</p>

                            <div className="ml-11">
                                {!isWalletConnected ? (
                                    <button
                                        onClick={() => setIsWalletConnected(true)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#f6851b]/10 hover:bg-[#f6851b]/20 text-[#f6851b] border border-[#f6851b]/30 font-bold py-3 px-6 rounded-xl transition-colors"
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
                                        Conectar MetaMask
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-emerald-700">Carteira Conectada</span>
                                        </div>
                                        <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">
                                            0x71C...976F
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Passo 2: Dados do Titular */}
                        <div className={`bg-white p-8 rounded-[24px] shadow-sm border border-slate-200 transition-opacity duration-300 ${!isWalletConnected ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold text-[#0c1b35] mb-2 flex items-center gap-3">
                                <span className="bg-[#0c1b35] text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                                Dados do Titular
                            </h2>
                            <p className="text-slate-500 mb-6 ml-11">Essas informações são para a organização do evento.</p>

                            <form className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                                    <input type="text" defaultValue="Felipe Tsuchiya" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">E-mail</label>
                                    <input type="email" defaultValue="felipe@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">CPF</label>
                                    <input type="text" placeholder="000.000.000-00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors" />
                                </div>
                            </form>
                        </div>

                    </div>

                    {/* COLUNA DIREITA: Resumo do Pedido */}
                    <div className="w-full lg:w-100">
                        <div className="bg-[#0c1b35] rounded-3xl p-8 shadow-2xl text-white sticky top-8 border border-slate-800">
                            <h3 className="text-xl font-bold mb-6">Resumo do Pedido</h3>

                            {/* Card interno do Evento */}
                            <div className="bg-[#16274a] p-4 rounded-xl mb-6 flex gap-4 items-center">
                                <img
                                    src="https://picsum.photos/seed/dixx/100/100"
                                    alt="Capa"
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">{mockOrder.evento}</h4>
                                    <p className="text-sky-400 text-xs font-semibold mt-1">{mockOrder.data}</p>
                                    <p className="text-slate-400 text-xs mt-0.5 truncate">{mockOrder.local}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Ingresso Único NFT (x{mockOrder.quantidade})</span>
                                    <span className="font-medium">{subtotal.toFixed(3)} ETH</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400 text-sm">
                                    <span className="flex items-center gap-1">
                                        Taxa da Rede (Gas)
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </span>
                                    <span>~ {mockOrder.taxaGas.toFixed(4)} ETH</span>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-700 mb-6"></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="font-bold text-lg">Total</span>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-sky-400">{total.toFixed(4)} ETH</div>
                                    <div className="text-slate-400 text-sm font-medium">≈ R$ 850,00</div>
                                </div>
                            </div>

                            <button
                                disabled={!isWalletConnected}
                                className="w-full bg-[#0d59f7] hover:bg-[#0047e0] disabled:bg-slate-700 disabled:text-slate-400 text-white font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                {isWalletConnected ? 'MINTAR E PAGAR' : 'CONECTE A CARTEIRA'}
                            </button>

                            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                Transação segura via Smart Contract
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}