import { Link } from 'react-router-dom'; // Importe o Link aqui no topo
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
        <div className="w-full max-w-7xl px-6 my-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {events.map((evento) => (
                    <Link key={evento.id} to={`/detalhes/${evento.id}`} className="w-full">
                        <EventCard event={evento} />
                    </Link>
                ))}
            </div>
        </div>
    );
}