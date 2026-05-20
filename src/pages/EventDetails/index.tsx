import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useMetaMask } from '../../hooks/useMetaMask';

type MintStatus = 'idle' | 'connecting' | 'minting' | 'saving' | 'success' | 'error';
type BuyStatus = 'idle' | 'buying' | 'saving' | 'success' | 'error';

type Revenda = {
    id: number;
    token_id: number;
    resale_price_wei: string;
    carteira_vendedor: string | null;
};

export function EventDetails() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);

    const { account, isConnecting, isMinting, error: walletError, connect, mintTicket, buyResaleTicket } = useMetaMask();
    const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
    const [txHash, setTxHash] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [revendas, setRevendas] = useState<Revenda[]>([]);
    const [buyStatus, setBuyStatus] = useState<BuyStatus>('idle');
    const [buyingId, setBuyingId] = useState<number | null>(null);
    const [buyError, setBuyError] = useState('');

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
    const blockchainEventId: number = event?.blockchain_event_id ?? 0;

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

    async function handleComprar() {
        setErrorMsg('');

        if (!isLoggedIn) {
            setErrorMsg('Você precisa estar logado para comprar um ingresso.');
            return;
        }

        if (!event?.blockchain_event_id) {
            setErrorMsg('Este evento ainda não está disponível para compra na blockchain.');
            return;
        }

        // 1. Conectar MetaMask
        if (!account) {
            setMintStatus('connecting');
            const addr = await connect();
            if (!addr) {
                setMintStatus('error');
                setErrorMsg(walletError ?? 'Conexão com MetaMask cancelada.');
                return;
            }
        }

        // 2. Mint via MetaMask — NFT vai direto para a wallet do comprador
        setMintStatus('minting');
        const result = await mintTicket(
            blockchainEventId,
            priceWei,
            `https://koyn.app/metadata/evento/${event?.id}`,
        );

        if (!result) {
            setMintStatus('error');
            setErrorMsg(walletError ?? 'Transação cancelada ou falhou.');
            return;
        }

        // 3. Registrar no backend
        setMintStatus('saving');
        try {
            await api.post('/api/ingressos/registrar-mint', {
                id_evento: event?.id,
                token_id: Number(result.tokenId),
                tx_hash: result.txHash,
                carteira_comprador: result.buyer,
            });
            setTxHash(result.txHash);
            setTokenId(result.tokenId);
            setMintStatus('success');
        } catch {
            setMintStatus('error');
            setErrorMsg('NFT mintado! Mas falhou ao salvar no servidor. Guarde o txHash abaixo.');
            setTxHash(result.txHash);
            setTokenId(result.tokenId);
        }
    }

    const isLoading = ['connecting', 'minting', 'saving'].includes(mintStatus) || isConnecting || isMinting;

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

            {/* MERCADO DE REVENDA */}
            {revendas.length > 0 && (
                <div className="w-full max-w-3xl px-6 mb-10">
                    <h2 className="text-2xl font-extrabold text-[#0c1b35] mb-4">
                        Ingressos em <span className="text-amber-500">Revenda</span>
                    </h2>
                    <div className="flex flex-col gap-3">
                        {revendas.map(rev => (
                            <div key={rev.id} className="bg-white border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-[#0c1b35]">Token NFT <span className="font-mono text-sky-600">#{rev.token_id}</span></span>
                                    <span className="text-amber-600 font-bold text-lg">{(Number(rev.resale_price_wei) / 1e18).toFixed(4)} ETH</span>
                                    {rev.carteira_vendedor && (
                                        <span className="text-slate-400 font-mono text-xs">Vendedor: {shortAddr(rev.carteira_vendedor)}</span>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button
                                        onClick={() => handleComprarRevenda(rev)}
                                        disabled={buyingId === rev.id}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {buyingId === rev.id
                                            ? (buyStatus === 'buying' ? 'Aguarde MetaMask...' : 'Salvando...')
                                            : 'Comprar Revenda'}
                                    </button>
                                    {buyingId === rev.id && buyError && (
                                        <p className="text-red-500 text-xs text-right max-w-48">{buyError}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {buyStatus === 'success' && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm font-medium">
                            Ingresso de revenda comprado com sucesso! Veja em Meus Ingressos.
                        </div>
                    )}
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

                {/* Status da wallet */}
                <div className="mb-4 text-sm">
                    {account
                        ? <span className="text-green-600 font-medium flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>MetaMask: {shortAddr(account)}</span>
                        : <span className="text-slate-400">MetaMask não conectado</span>
                    }
                </div>

                {mintStatus !== 'success' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col text-center md:text-left">
                            <span className="font-bold text-xl text-slate-800">Ingresso Único</span>
                            <span className="font-medium text-sky-500 mt-1">{priceEth}</span>
                            <span className="text-xs text-gray-400 mt-1">NFT ERC-721 • Rede Sepolia</span>
                            {!event.blockchain_event_id && (
                                <span className="text-xs text-amber-500 mt-1">Venda blockchain não configurada</span>
                            )}
                        </div>
                        <button
                            onClick={handleComprar}
                            disabled={isLoading || !event.blockchain_event_id}
                            className="px-10 py-4 text-white font-extrabold text-lg bg-[#0d59f7] hover:bg-[#0047e0] rounded-2xl shadow-xl transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {mintStatus === 'connecting' || isConnecting ? 'Conectando...'
                                : mintStatus === 'minting' || isMinting ? 'Aguarde MetaMask...'
                                : mintStatus === 'saving' ? 'Salvando...'
                                : account ? 'Comprar com MetaMask' : 'Conectar e Comprar'}
                        </button>
                    </div>
                )}

                {/* Erro */}
                {(mintStatus === 'error') && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                        {errorMsg || walletError}
                        {txHash && <div className="mt-2 text-xs break-all font-mono"><span className="font-bold">TxHash: </span>{txHash}</div>}
                    </div>
                )}

                {/* Sucesso */}
                {mintStatus === 'success' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div className="text-green-700 font-bold text-xl mb-3">Ingresso NFT Mintado!</div>
                        <div className="space-y-2 text-sm">
                            <div><span className="font-semibold text-gray-600">Token ID: </span><span className="font-mono text-blue-700">#{tokenId}</span></div>
                            <div><span className="font-semibold text-gray-600">Dono (on-chain): </span><span className="font-mono text-gray-800">{account && shortAddr(account)}</span></div>
                            <div>
                                <span className="font-semibold text-gray-600">Transação: </span>
                                <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noreferrer" className="font-mono text-blue-600 hover:underline break-all">
                                    {txHash.slice(0, 20)}...
                                </a>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">Seu ingresso está registrado na blockchain Sepolia e no sistema Koyn.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
