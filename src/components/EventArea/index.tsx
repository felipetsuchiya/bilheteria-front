import { EventCard } from "../../components/EventCard";

export function EventArea() {
    return (
        <div className="mx-97.5">
            <div className="grid grid-cols-4 place-items-center w-full">
                <EventCard />
                <EventCard />
                <EventCard />
                <EventCard />
            </div>
        </div>
    )
}