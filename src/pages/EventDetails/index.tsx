import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api'; // Ajuste o caminho se necessário

export function EventDetails() {

    const navigate = useNavigate();

    const { id } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Estado para controlar a quantidade de ingressos que a pessoa quer comprar
    const [quantidade, setQuantidade] = useState(1);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/api/eventos/${id}`);
                setEvent(response.data);
            } catch (error) {
                console.error("Erro ao buscar os detalhes do evento:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    // Funções para formatar a data que vem do banco para o seu layout visual
    const getDia = (dataString?: string) => {
        if (!dataString) return "--";
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: 'UTC' });
    };

    const getMes = (dataString?: string) => {
        if (!dataString) return "---";
        const data = new Date(dataString);
        // Retorna "abr", "mai", etc., e nós deixamos maiúsculo
        return data.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase();
    };

    const getDiaSemanaEHora = (dataString?: string) => {
        if (!dataString) return "";
        const data = new Date(dataString);
        const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long', timeZone: 'UTC' });
        // Pega a hora. Como o GMT vem "00:00:00", se o seu banco salvar a hora certa, isso vai refletir aqui.
        const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

        // Ex: "quinta-feira às 22:00" -> Deixamos a primeira letra maiúscula
        const stringFormatada = `${diaSemana} às ${hora}h`;
        return stringFormatada.charAt(0).toUpperCase() + stringFormatada.slice(1);
    };

    // Funções do contador
    const handleIncrement = () => setQuantidade(prev => prev + 1);
    const handleDecrement = () => setQuantidade(prev => (prev > 1 ? prev - 1 : 1));

    if (isLoading) {
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

            {/* ESCOLHA DO INGRESSO */}
            <div className="w-full max-w-3xl px-6 mb-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c1b35] mb-4">
                    Escolha o seu ingresso
                </h1>

                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col text-center md:text-left">
                        <span className="font-bold text-xl text-slate-800">Ingresso Único</span>
                        {/* Se o backend ainda não retornar preço, deixamos um fallback de segurança */}
                        <span className="font-medium text-sky-500 mt-1">
                            {event.preco_eth ? `${event.preco_eth} ETH` : "Preço sob consulta"}
                        </span>
                    </div>

                    <div className="flex items-center gap-6 bg-slate-50 p-2 rounded-full border border-slate-200">
                        <button
                            onClick={handleDecrement}
                            className="rounded-full bg-[#0c1b35] hover:bg-[#16274a] text-white text-2xl w-12 h-12 flex items-center justify-center cursor-pointer transition-colors select-none shadow-sm"
                        >
                            -
                        </button>
                        <span className="font-black text-2xl text-slate-800 w-6 text-center select-none">
                            {quantidade}
                        </span>
                        <button
                            onClick={handleIncrement}
                            className="rounded-full bg-[#0c1b35] hover:bg-[#16274a] text-white text-2xl w-12 h-12 flex items-center justify-center cursor-pointer transition-colors select-none shadow-sm"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="px-10 py-5 text-white font-extrabold text-xl bg-[#0d59f7] hover:bg-[#0047e0] rounded-2xl shadow-xl transition-transform hover:-translate-y-1 w-full max-w-md mx-6 mb-20">
                COMPRAR INGRESSO
            </button>
        </div>
    );
}