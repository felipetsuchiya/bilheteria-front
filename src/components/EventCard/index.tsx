import { FaRegCalendarAlt } from "react-icons/fa";

interface EventCardProps {
    event: {
        id: number;
        nome: string;
        data_hora?: string;
        local_evento?: string;
    };
}

export function EventCard({ event }: EventCardProps) {
    const formatarData = (dataString?: string) => {
        if (!dataString) return "Data a definir";

        const data = new Date(dataString);

        return data.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC'
        });
    };

    return (
        <div className="flex flex-col w-full group cursor-pointer transition-transform hover:scale-105 duration-200">
            <img
                className="w-full h-72 rounded-2xl object-cover shadow-md"
                src={`https://picsum.photos/seed/${event.id}/276/338`}
                alt={`Capa do evento ${event.nome}`}
            />
            <div className="pt-3">
                <div className="text-xl font-bold leading-tight text-[#0c1b35] group-hover:text-sky-500 transition-colors line-clamp-2">
                    {event.nome}
                </div>
                <div className="text-red-600 text-base flex items-center gap-x-2 mt-1 font-medium">
                    <FaRegCalendarAlt /> {formatarData(event.data_hora)}
                </div>
                <div className="text-[14px] font-semibold text-slate-700 mt-1 truncate">
                    {event.local_evento || "Localização não informada"}
                </div>
            </div>
        </div>
    );
}