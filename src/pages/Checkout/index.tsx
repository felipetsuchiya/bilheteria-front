import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useMetaMask } from '../../hooks/useMetaMask';

type CheckoutStatus = 'idle' | 'connecting' | 'minting' | 'saving' | 'success' | 'error';

export function Checkout() {
    const { eventoId } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [status, setStatus] = useState<CheckoutStatus>('idle');
    const [txHash, setTxHash] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { account, isConnecting, isMinting, error: walletError, connect, mintTicket } = useMetaMask();

    // Usuário logado vindo do localStorage
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('@App:usuario') || 'null'); } catch { return null; }
    })();

    useEffect(() => {
        if (!eventoId) return;
        api.get(`/api/eventos/${eventoId}`)
            .then(r => setEvent(r.data))
            .catch(() => navigate('/'))
            .finally(() => setIsFetching(false));
    }, [eventoId]);

    const priceWei: string = event?.ticket_price_wei ?? '0';
    const priceEth = priceWei === '0' ? '—' : (Number(priceWei) / 1e18).toFixed(4);

    const formatData = (d?: string) => {
        if (!d) return '—';
        const dt = new Date(d);
        return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
            + ' às '
            + dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) + 'h';
    };

    const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;
    const isLoading = ['connecting', 'minting', 'saving'].includes(status) || isConnecting || isMinting;

    async function handleMint() {
        setErrorMsg('');

        if (!event?.blockchain_event_id) {
            setErrorMsg('Este evento não está disponível para compra na blockchain.');
            return;
        }

        // 1. Conectar MetaMask se necessário
        let walletAddr = account;
        if (!walletAddr) {
            setStatus('connecting');
            const addr = await connect();
            if (!addr) {
                setStatus('error');
                setErrorMsg(walletError ?? 'Conexão com MetaMask cancelada.');
                return;
            }
            walletAddr = addr;
        }

        // 2. Mint via MetaMask — NFT vai direto para a carteira do comprador
        setStatus('minting');
        const result = await mintTicket(
            event.blockchain_event_id,
            priceWei,
            `https://koyn.app/metadata/evento/${event.id}`,
        );

        if (!result) {
            setStatus('error');
            setErrorMsg(walletError ?? 'Transação cancelada ou falhou.');
            return;
        }

        // 3. Registrar no backend
        setStatus('saving');
        try {
            await api.post('/api/ingressos/registrar-mint', {
                id_evento: event.id,
                token_id: Number(result.tokenId),
                tx_hash: result.txHash,
                carteira_comprador: result.buyer,
            });
            setTxHash(result.txHash);
            setTokenId(result.tokenId);
            setStatus('success');
        } catch (e: any) {
            setTxHash(result.txHash);
            setTokenId(result.tokenId);

            // JWT expirado ou inválido — sessão encerrada durante o mint
            if (e.response?.status === 401) {
                setStatus('error');
                setErrorMsg(
                    `⚠️ Seu NFT foi mintado com sucesso na blockchain, mas sua sessão expirou antes de salvarmos no sistema.\n\n` +
                    `Guarde este txHash: ${result.txHash}\n\n` +
                    `Faça login novamente e entre em contato com o suporte informando o txHash acima para regularizar seu ingresso.`
                );
                // Limpa o token expirado para forçar novo login
                localStorage.removeItem('@App:token');
                localStorage.removeItem('@App:usuario');
            } else {
                setStatus('error');
                setErrorMsg(`NFT mintado! Mas falhou ao salvar no servidor.\nGuarde o txHash: ${result.txHash}`);
            }
        }
    }

    if (isFetching) return (
        <div className="flex justify-center items-center min-h-screen text-sky-500 font-bold text-xl">
            Carregando...
        </div>
    );

    if (!event) return null;

    // ── TELA DE SUCESSO ──────────────────────────────────────────────
    if (status === 'success') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-[#0c1b35] mb-2">Ingresso NFT Mintado!</h2>
                <p className="text-slate-500 mb-6">Seu ingresso está registrado na blockchain Sepolia e no sistema Koyn.</p>
                <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Evento</span>
                        <span className="font-bold text-slate-800">{event.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Token ID</span>
                        <span className="font-mono font-bold text-sky-600">#{tokenId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Carteira</span>
                        <span className="font-mono text-slate-600">{account ? shortAddr(account) : '—'}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-slate-500 font-medium block mb-1">Transação</span>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-sky-600 hover:underline break-all text-xs"
                        >
                            {txHash}
                        </a>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/minha-conta')}
                    className="w-full bg-[#0d59f7] hover:bg-[#0047e0] text-white font-extrabold py-3 rounded-xl transition-colors"
                >
                    Ver Meus Ingressos
                </button>
            </div>
        </div>
    );

    // ── TELA PRINCIPAL DO CHECKOUT ───────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 pt-10 pb-20">
            <div className="max-w-6xl mx-auto px-6">

                <button
                    onClick={() => navigate(`/detalhes/${eventoId}`)}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#0c1b35] mb-8 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Voltar para o evento
                </button>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0c1b35] mb-8 tracking-tight">
                    Finalizar <span className="text-sky-500">Compra</span>
                </h1>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* COLUNA ESQUERDA */}
                    <div className="flex-1 flex flex-col gap-8">

                        {/* Passo 1: Carteira Web3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                            <h2 className="text-xl font-bold text-[#0c1b35] mb-2 flex items-center gap-3">
                                <span className="bg-[#0c1b35] text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">1</span>
                                Conectar Carteira
                            </h2>
                            <p className="text-slate-500 mb-6 ml-11">Para receber seu ingresso NFT, conecte sua carteira digital.</p>

                            <div className="ml-11">
                                {account ? (
                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                                            <span className="font-semibold text-emerald-700">Carteira Conectada</span>
                                        </div>
                                        <span className="text-sm font-medium text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg font-mono">
                                            {shortAddr(account)}
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={async () => { setStatus('connecting'); await connect(); setStatus('idle'); }}
                                        disabled={isConnecting}
                                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#f6851b]/10 hover:bg-[#f6851b]/20 text-[#f6851b] border border-[#f6851b]/30 font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-6 h-6" />
                                        {isConnecting ? 'Conectando...' : 'Conectar MetaMask'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Passo 2: Dados do Titular */}
                        <div className={`bg-white p-8 rounded-3xl shadow-sm border border-slate-200 transition-opacity duration-300 ${!account ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold text-[#0c1b35] mb-2 flex items-center gap-3">
                                <span className="bg-[#0c1b35] text-white w-8 h-8 flex items-center justify-center rounded-full text-sm">2</span>
                                Dados do Titular
                            </h2>
                            <p className="text-slate-500 mb-6 ml-11">Informações da sua conta Koyn.</p>

                            <div className="ml-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={user?.nome ?? ''}
                                        readOnly
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-600 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">E-mail</label>
                                    <input
                                        type="email"
                                        value={user?.email ?? ''}
                                        readOnly
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-600 cursor-not-allowed"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Carteira (on-chain)</label>
                                    <input
                                        type="text"
                                        value={account ? shortAddr(account) : 'Conecte a carteira'}
                                        readOnly
                                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 outline-none text-slate-600 cursor-not-allowed font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Erro */}
                        {status === 'error' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                                {errorMsg || walletError}
                                {txHash && (
                                    <div className="mt-2 text-xs break-all font-mono">
                                        <span className="font-bold">TxHash: </span>{txHash}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* COLUNA DIREITA: Resumo */}
                    <div className="w-full lg:w-100">
                        <div className="bg-[#0c1b35] rounded-3xl p-8 shadow-2xl text-white sticky top-8 border border-slate-800">
                            <h3 className="text-xl font-bold mb-6">Resumo do Pedido</h3>

                            {/* Card do Evento */}
                            <div className="bg-[#16274a] p-4 rounded-xl mb-6 flex gap-4 items-center">
                                <img
                                    src={`https://picsum.photos/seed/${event.id}/100/100`}
                                    alt="Capa"
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-lg leading-tight truncate">{event.nome}</h4>
                                    <p className="text-sky-400 text-xs font-semibold mt-1">{formatData(event.data_hora)}</p>
                                    <p className="text-slate-400 text-xs mt-0.5 truncate">{event.local_evento}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-slate-300">
                                    <span>Ingresso Único NFT</span>
                                    <span className="font-medium">{priceEth} ETH</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400 text-sm">
                                    <span className="flex items-center gap-1">
                                        Taxa da Rede (Gas)
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </span>
                                    <span>Calculada pelo MetaMask</span>
                                </div>
                            </div>

                            <div className="h-px w-full bg-slate-700 mb-6"></div>

                            <div className="flex justify-between items-end mb-8">
                                <span className="font-bold text-lg">Preço do Ingresso</span>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-sky-400">{priceEth} ETH</div>
                                    <div className="text-slate-400 text-xs mt-1">+ gas fee (MetaMask)</div>
                                </div>
                            </div>

                            <button
                                onClick={handleMint}
                                disabled={isLoading || !event.blockchain_event_id}
                                className="w-full bg-[#0d59f7] hover:bg-[#0047e0] disabled:bg-slate-700 disabled:text-slate-400 text-white font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                {status === 'connecting' || isConnecting ? (
                                    <><span className="animate-spin">⟳</span> Conectando MetaMask...</>
                                ) : status === 'minting' || isMinting ? (
                                    <><span className="animate-spin">⟳</span> Aguarde MetaMask...</>
                                ) : status === 'saving' ? (
                                    <><span className="animate-spin">⟳</span> Registrando...</>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        {account ? 'MINTAR E PAGAR' : 'CONECTAR E PAGAR'}
                                    </>
                                )}
                            </button>

                            {!event.blockchain_event_id && (
                                <p className="text-center text-xs text-amber-400 mt-3">
                                    Venda blockchain não configurada para este evento.
                                </p>
                            )}

                            <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Transação segura via Smart Contract
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
