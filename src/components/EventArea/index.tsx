import { EventCard } from "../EventCard";

interface EventAreaProps {
    events: any[];
}

export function EventArea({ events }: EventAreaProps) {
    if (events.length === 0) {
        return (
            <div className="text-center text-slate-500 my-10">
                Nenhum evento disponível no momento. Fique ligado!
            </div>
        );
    }

    return (
        <div className="w-full max-w-300 px-6 my-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 place-items-center">
                {events.map((evento) => (
                    // O Link envolve o Card e passa o ID na URL para a tela de detalhes
                    <a key={evento.id} href={`/detalhes/${evento.id}`}>
                        <EventCard event={evento} />
                    </a>
                ))}
            </div>
        </div>
    );
}