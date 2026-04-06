import { EventArea } from "../../components/EventArea";

export function Home() {
    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-5">Compre ingressos exclusivos com NFT</h1>
            <EventArea /> 
            <EventArea /> 
            <EventArea /> 
        </div>
    )
}