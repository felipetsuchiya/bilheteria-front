import { FaRegCalendarAlt } from "react-icons/fa";

export function EventCard() {
    return (
        <div className="flex flex-col">
            <img className="h-84.5 w-69 rounded-2xl" src="https://picsum.photos/seed/picsum/200/300" alt="" />
            <div className="pt-1">
                <div id="title" className="text-xl font-bold wrap-anywhere leading-none">Dixxxtrava</div>
                <div id="date" className="text-red-600 text-base flex items-center gap-x-2"><FaRegCalendarAlt />30 de abril</div>
                <div id="city" className="text-[14px] font-semibold">Curitiba - PR</div>
                <div id="place" className="text-xs uppercase text-gray-500">Live</div>
            </div>
        </div>
    )
}