import React, { useEffect, useState } from 'react';
import { EventArea } from "../../components/EventArea"; // Ajuste o caminho
import { api } from "../../services/api"; // Ajuste o caminho

export function Home() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Rota que retorna o catálogo público de eventos
                const response = await api.get('/api/eventos');
                setEvents(response.data);
                console.log(response)
            } catch (error) {
                console.error("Erro ao carregar os eventos da home:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="flex flex-col items-center bg-slate-50 min-h-screen py-12">
            <div className="text-center mb-10 px-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0c1b35] mb-2 tracking-tight">
                    Compre ingressos exclusivos na <span className="text-sky-500">KOYM</span>
                </h1>
                <p className="text-slate-500 font-medium">
                    Os melhores eventos do mundo não, do BRASIL!!!.
                </p>
            </div>
            
            {isLoading ? (
                <div className="text-sky-500 font-bold animate-pulse mt-10">
                    Carregando os melhores eventos...
                </div>
            ) : (
                // Chamamos a EventArea apenas uma vez passando o array preenchido
                <EventArea events={events} /> 
            )}
        </div>
    );
}