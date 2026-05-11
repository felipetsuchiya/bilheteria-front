import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useMetaMask } from '../../hooks/useMetaMask';

type MintStatus = 'idle' | 'connecting' | 'minting' | 'saving' | 'success' | 'error';

export function EventDetails() {
    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);

    const { account, isConnecting, isMinting, error: walletError, connect, mintTicket } = useMetaMask();
    const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
    const [txHash, setTxHash] = useState('');
    const [tokenId, setTokenId] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/api/eventos/${id}`);
                setEvent(response.data);
            } catch (error) {
                console.error("Erro ao buscar os detalhes do evento:", error);
            } finally {
                setIsFetching(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    const getDia = (dataString?: string) => {
        if (!dataString) return "--";
        return new Date(dataString).toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' });
    };

    const getMes = (dataString?: string) => {
        if (!dataString) return "---";
        return new Date(dataString)
            .toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })
            .replace('.', '')
            .toUpperCase();
    };

    const getDiaSemanaEHora = (dataString?: string) => {
        if (!dataString) return "";
        const data = new Date(dataString);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
        const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
        const str = `${diaSemana} às ${hora}h`;
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    async function handleComprar() {
        setErrorMsg('');

        if (!account) {
            setMintStatus('connecting');
            const addr = await connect();
            if (!addr) {
                setMintStatus('error');
                setErrorMsg(walletError ?? 'Conexão cancelada');
                return;
            }
        }

        setMintStatus('minting');
        const priceWei = event?.preco_eth
            ? (parseFloat(event.preco_eth) * 1e18).toFixed(0)
            : '0';
        const blockchainEventId = event?.id_blockchain ?? 0;

        const result = await mintTicket(
            blockchainEventId,
            priceWei,
            `https://koyn.app/metadata/${event?.id}`
        );

        if (!result) {
            setMintStatus('error');
            setErrorMsg(walletError ?? 'Transação falhou ou foi cancelada');
            return;
        }

        setMintStatus('saving');
        try {
            const token = localStorage.getItem('@App:token');
            await api.post('/api/ingressos/registrar-mint', {
                id_evento: event?.id,
                token_id: Number(result.tokenId),
                tx_hash: result.txHash,
                carteira_comprador: result.buyer,
            }, { headers: { Authorization: `Bearer ${token}` } });

            setTxHash(result.txHash);
            setTokenId(result.tokenId);
            setMintStatus('success');
        } catch {
            setMintStatus('error');
            setErrorMsg('NFT mintado mas falhou ao salvar no servidor. Guarde o txHash.');
            setTxHash(result.txHash);
            setTokenId(result.tokenId);
        }
    }

    const isLoading = mintStatus === 'connecting' || mintStatus === 'minting' || mintStatus === 'saving' || isConnecting || isMinting;

    if (isFetching) {
        return (
            <div className="flex justify-center items-center min-h-screen text-sky-500 font-bold text-xl">
                Carregando detalhes do evento...
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex justify-center items-center min-h-screen text-slate-500 font-bold text-xl">
                Evento não encontrado.
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center min-h-screen py-10 bg-slate-50">
            {/* HEADLINE DO EVENTO */}
            <div className="flex flex-col md:flex-row justify-center items-center max-w-5xl w-full px-6">
                <img
                    className="w-full md:w-103.5 h-auto md:h-127.5 object-cover rounded-3xl mx-3 shadow-2xl"
                    src={`https://picsum.photos/seed/${event.id}/414/510`}
                    alt={`Capa de ${event.nome}`}
                />
                <div className="flex flex-col mx-6 mt-8 md:mt-0 w-full">
                    <div className="text-[40px] md:text-[60px] font-bold text-[#0c1b35] leading-tight wrap-break-word">
                        {event.nome}
                    </div>

                    <div className="flex justify-start items-center gap-6 md:gap-10 mt-6">
                        <div className="flex flex-col text-red-600 items-center bg-red-50 p-4 rounded-2xl shadow-sm border border-red-100 min-w-25">
                            <div className="text-[50px] md:text-[60px] font-black leading-none tracking-tighter">
                                {getDia(event.data_hora)}
                            </div>
                            <div className="text-[30px] md:text-[40px] font-bold leading-none mt-1">
                                {getMes(event.data_hora)}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <div className="text-[20px] md:text-[25px] font-bold text-slate-800">
                                {event.local_evento || "Localização a definir"}
                            </div>
                            <div className="text-[18px] font-bold text-red-600 mt-1">
                                {getDiaSemanaEHora(event.data_hora)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESCRIÇÃO DO EVENTO */}
            <div className="w-full max-w-3xl px-6 my-12">
                <h1 className="font-extrabold text-2xl md:text-3xl text-[#0c1b35] mb-4 border-b-2 border-slate-200 pb-2">
                    DESCRIÇÃO DO EVENTO
                </h1>
                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                    {event.descricao_evento || "Nenhuma descrição fornecida pela organização."}
                </div>
            </div>

            {/* COMPRAR INGRESSO NFT */}
            <div className="w-full max-w-3xl px-6 mb-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c1b35] mb-4">
                    Comprar Ingresso NFT
                </h1>

                {/* Status da carteira */}
                <div className="mb-4">
                    {account ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                            MetaMask conectado: {shortAddress(account)}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400">MetaMask não conectado</div>
                    )}
                </div>

                {/* Card do ingresso */}
                {mintStatus !== 'success' && (
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col text-center md:text-left">
                            <span className="font-bold text-xl text-slate-800">Ingresso Único</span>
                            <span className="font-medium text-sky-500 mt-1">
                                {event.preco_eth ? `${event.preco_eth} ETH` : "Preço sob consulta"}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">NFT ERC-721 • Rede Sepolia</span>
                        </div>

                        <button
                            onClick={handleComprar}
                            disabled={isLoading}
                            className="px-10 py-4 text-white font-extrabold text-lg bg-[#0d59f7] hover:bg-[#0047e0] rounded-2xl shadow-xl transition-transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        >
                            {mintStatus === 'connecting' || isConnecting ? 'Conectando...' :
                             mintStatus === 'minting' || isMinting     ? 'Aguarde MetaMask...' :
                             mintStatus === 'saving'                    ? 'Salvando...' :
                             account ? 'Comprar com MetaMask' : 'Conectar e Comprar'}
                        </button>
                    </div>
                )}

                {/* Erro */}
                {(mintStatus === 'error' || walletError) && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                        {errorMsg || walletError}
                        {txHash && (
                            <div className="mt-2 text-xs break-all">
                                <span className="font-bold">TxHash salvo: </span>{txHash}
                            </div>
                        )}
                    </div>
                )}

                {/* Sucesso */}
                {mintStatus === 'success' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-6">
                        <div className="text-green-700 font-bold text-xl mb-3">Ingresso NFT Mintado!</div>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-semibold text-gray-600">Token ID: </span>
                                <span className="font-mono text-blue-700">#{tokenId}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Carteira: </span>
                                <span className="font-mono text-gray-800">{account && shortAddress(account)}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-600">Transação: </span>
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-mono text-blue-600 hover:underline break-all"
                                >
                                    {txHash.slice(0, 20)}...
                                </a>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-400">
                            Seu ingresso está registrado na blockchain Sepolia e no sistema Koyn.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
