import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useMetaMask } from '../../hooks/useMetaMask';

type BuyStatus = 'idle' | 'buying' | 'saving' | 'success' | 'error';

type Revenda = {
    id: number;
    token_id: number;
    resale_price_wei: string;
    carteira_vendedor: string | null;
};

export function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);

    const { account, isConnecting, connect, error: walletError, buyResaleTicket } = useMetaMask();

    const [revendas, setRevendas] = useState<Revenda[]>([]);
    const [buyStatus, setBuyStatus] = useState<BuyStatus>('idle');
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [buyError, setBuyError] = useState('');

    // Dados da compra bem-sucedida para tela de sucesso
    const [successTxHash, setSuccessTxHash] = useState('');
    const [successTokenId, setSuccessTokenId] = useState<number | null>(null);
    const [successPriceWei, setSuccessPriceWei] = useState('');

    useEffect(() => {
        api.get(`/api/eventos/${id}`)
            .then(r => setEvent(r.data))
            .catch(() => {})
            .finally(() => setIsFetching(false));
    }, [id]);

    useEffect(() => {
        if (id) {
            api.get(`/api/ingressos/evento/${id}/revenda`)
                .then(r => setRevendas(r.data.revendas ?? []))
                .catch(() => {});
        }
    }, [id]);

    const isLoggedIn = !!localStorage.getItem('@App:token');

    const priceWei: string = event?.ticket_price_wei ?? '0';
    const priceEth: string = priceWei === '0' ? '—' : (Number(priceWei) / 1e18).toFixed(4) + ' ETH';

    const getDia = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' }) : '--';
    const getMes = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase() : '---';
    const getDiaSemanaEHora = (d?: string) => {
        if (!d) return '';
        const dt = new Date(d);
        const dia = dt.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
        const hora = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        const s = `${dia} às ${hora}h`;
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    const shortAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

    function handleComprar() {
        if (!isLoggedIn) {
            navigate('/login', { state: { from: `/detalhes/${id}` } });
            return;
        }
        navigate(`/checkout/${id}`);
    }

    async function handleComprarRevenda(revenda: Revenda) {
        setBuyError('');
        if (!isLoggedIn) { setBuyError('Você precisa estar logado para comprar.'); return; }

        setBuyingId(revenda.id);
        setBuyStatus('buying');
        const result = await buyResaleTicket(revenda.token_id, revenda.resale_price_wei);
        if (!result) {
            setBuyStatus('error');
            setBuyError(walletError ?? 'Transação cancelada ou falhou.');
            setBuyingId(null);
            return;
        }

        setBuyStatus('saving');
        try {
            await api.post(`/api/ingressos/${revenda.id}/comprar-revenda`, {
                tx_hash: result.txHash,
                carteira_comprador: result.buyer,
            });
            setRevendas(prev => prev.filter(r => r.id !== revenda.id));
            setSuccessTxHash(result.txHash);
            setSuccessTokenId(revenda.token_id);
            setSuccessPriceWei(revenda.resale_price_wei);
            setBuyStatus('success');
        } catch {
            setBuyError('Compra registrada na blockchain, mas falhou no servidor. Guarde o txHash.');
            setBuyStatus('error');
        } finally {
            setBuyingId(null);
        }
    }

    if (isFetching) return (
        <div className="flex justify-center items-center min-h-screen text-sky-500 font-bold text-xl">
            Carregando...
        </div>
    );

    if (!event) return (
        <div className="flex justify-center items-center min-h-screen text-slate-500 font-bold text-xl">
            Evento não encontrado.
        </div>
    );

    // ── TELA DE SUCESSO APÓS COMPRA DE REVENDA ───────────────────────
    if (buyStatus === 'success') return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
            <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-[#0c1b35] mb-2">Ingresso Adquirido!</h2>
                <p className="text-slate-500 mb-6">
                    Seu ingresso de revenda foi transferido para sua carteira na blockchain Sepolia.
                </p>

                <div className="bg-slate-50 rounded-xl p-4 text-left space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Evento</span>
                        <span className="font-bold text-slate-800 text-right max-w-48 truncate">{event.nome}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Token NFT</span>
                        <span className="font-mono font-bold text-sky-600">#{successTokenId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Valor pago</span>
                        <span className="font-bold text-amber-600">
                            {successPriceWei ? (Number(successPriceWei) / 1e18).toFixed(4) : '—'} ETH
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Carteira</span>
                        <span className="font-mono text-slate-600">{account ? shortAddr(account) : '—'}</span>
                    </div>
                    <div className="text-sm">
                        <span className="text-slate-500 font-medium block mb-1">Transação</span>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${successTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-sky-600 hover:underline break-all text-xs"
                        >
                            {successTxHash}
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

    return (
        <div className="flex flex-col justify-center items-center min-h-screen py-10 bg-slate-50">

            {/* HEADLINE */}
            <div className="flex flex-col md:flex-row justify-center items-center max-w-5xl w-full px-6">
                <img
                    className="w-full md:w-103.5 h-auto md:h-127.5 object-cover rounded-3xl mx-3 shadow-2xl"
                    src={`https://picsum.photos/seed/${event.id}/414/510`}
                    alt={`Capa de ${event.nome}`}
                />
                <div className="flex flex-col mx-6 mt-8 md:mt-0 w-full">
                    <div className="text-[40px] md:text-[60px] font-bold text-[#0c1b35] leading-tight">
                        {event.nome}
                    </div>
                    <div className="flex justify-start items-center gap-6 md:gap-10 mt-6">
                        <div className="flex flex-col text-red-600 items-center bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 min-w-25">
                            <div className="text-[50px] md:text-[60px] font-black leading-none tracking-tighter">{getDia(event.data_hora)}</div>
                            <div className="text-[30px] md:text-[40px] font-bold leading-none mt-1">{getMes(event.data_hora)}</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-[20px] md:text-[25px] font-bold text-slate-800">{event.local_evento || 'Localização a definir'}</div>
                            <div className="text-[18px] font-bold text-red-600 mt-1">{getDiaSemanaEHora(event.data_hora)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIÇÃO */}
            <div className="w-full max-w-3xl px-6 my-12">
                <h1 className="font-extrabold text-2xl md:text-3xl text-[#0c1b35] mb-4 border-b-2 border-slate-200 pb-2">
                    DESCRIÇÃO DO EVENTO
                </h1>
                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                    {event.descricao_evento || 'Nenhuma descrição fornecida.'}
                </div>
            </div>

            {/* BANNER METAMASK */}
            {!account && (
                <div className="w-full max-w-3xl px-6 mb-4">
                    <div className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-300 rounded-xl">
                        <p className="text-amber-800 text-sm font-medium">
                            🦊 MetaMask não conectada. Conecte sua carteira para comprar ingressos.
                        </p>
                        <button
                            onClick={connect}
                            disabled={isConnecting}
                            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isConnecting ? 'Conectando...' : 'Conectar'}
                        </button>
                    </div>
                </div>
            )}

            {/* MERCADO DE REVENDA */}
            {revendas.length > 0 && (
                <div className="w-full max-w-3xl px-6 mb-10">
                    <h2 className="text-2xl font-extrabold text-[#0c1b35] mb-4">
                        Ingressos em <span className="text-amber-500">Revenda</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {revendas.map(rev => {
                            const isOwner = !!(account && rev.carteira_vendedor &&
                                account.toLowerCase() === rev.carteira_vendedor.toLowerCase());

                            return (
                                <div key={rev.id} className="bg-white border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-bold text-[#0c1b35]">Token NFT <span className="font-mono text-sky-600">#{rev.token_id}</span></span>
                                        <span className="text-amber-600 font-bold text-lg">{(Number(rev.resale_price_wei) / 1e18).toFixed(4)} ETH</span>
                                        {rev.carteira_vendedor && (
                                            <span className="text-slate-400 font-mono text-xs">
                                                Vendedor: {shortAddr(rev.carteira_vendedor)}
                                                {isOwner && <span className="ml-1 text-amber-500 font-semibold">(você)</span>}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <button
                                            onClick={() => handleComprarRevenda(rev)}
                                            disabled={buyingId === rev.id || isOwner}
                                            title={isOwner ? 'Você não pode comprar seu próprio ingresso' : ''}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {buyingId === rev.id
                                                ? (buyStatus === 'buying' ? 'Aguarde MetaMask...' : 'Salvando...')
                                                : isOwner ? 'Seu ingresso' : 'Comprar Revenda'}
                                        </button>
                                        {isOwner && (
                                            <p className="text-amber-500 text-xs text-right">
                                                Conecte outra carteira para comprar
                                            </p>
                                        )}
                                        {buyingId === rev.id && buyError && (
                                            <p className="text-red-500 text-xs text-right max-w-48">{buyError}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {buyError && buyingId === null && (
                        <p className="mt-2 text-red-500 text-sm">{buyError}</p>
                    )}
                </div>
            )}

            {/* COMPRAR */}
            <div className="w-full max-w-3xl px-6 mb-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c1b35] mb-4">
                    Comprar Ingresso NFT
                </h1>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col text-center md:text-left">
                        <span className="font-bold text-xl text-slate-800">Ingresso Único</span>
                        <span className="font-medium text-sky-500 mt-1">{priceEth}</span>
                        <span className="text-xs text-gray-400 mt-1">NFT ERC-721 • Rede Sepolia</span>
                        {event.blockchain_event_id == null && (
                            <span className="text-xs text-amber-500 mt-1">Venda blockchain não configurada</span>
                        )}
                    </div>
                    <button
                        onClick={handleComprar}
                        disabled={event.blockchain_event_id == null}
                        className="px-10 py-4 text-white font-extrabold text-lg bg-[#0d59f7] hover:bg-[#0047e0] rounded-2xl shadow-xl transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {account ? 'Comprar com MetaMask' : 'Comprar Ingresso'}
                    </button>
                </div>
            </div>
        </div>
    );
}
