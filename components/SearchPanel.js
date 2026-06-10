"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Search, Users } from "lucide-react";
import { roomTypeLabel, titleCase } from "../lib/format";

const dateOffset = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

export default function SearchPanel({ hotels = [], roomTypes = [], compact = false, defaults = {} }) {
	const router = useRouter();
	const destinations = useMemo(() => {
		const values = new Set(["All"]);
		hotels.forEach((hotel) => {
			if (hotel.hotelCity) values.add(titleCase(hotel.hotelCity));
			if (hotel.hotelState) values.add(titleCase(hotel.hotelState));
		});
		return [...values];
	}, [hotels]);
	const [destination, setDestination] = useState(defaults.destination || "All");
	const [startDate, setStartDate] = useState(defaults.startDate || dateOffset(1));
	const [endDate, setEndDate] = useState(defaults.endDate || dateOffset(4));
	const [roomType, setRoomType] = useState(defaults.roomType || "all");
	const [adults, setAdults] = useState(defaults.adults || "1");
	const [children, setChildren] = useState(defaults.children || "");

	const submit = (event) => {
		event.preventDefault();
		const params = new URLSearchParams({
			destination,
			startDate,
			endDate,
			roomType,
			adults: adults || "1",
			children,
		});
		router.push(`/rooms?${params.toString()}`);
	};

	return (
		<form className={`search-panel ${compact ? "compact" : ""}`} onSubmit={submit}>
			<div className="field">
				<label>Destination</label>
				<select value={destination} onChange={(event) => setDestination(event.target.value)}>
					{destinations.map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>
			<div className="field">
				<label>Check-in</label>
				<div className="with-icon">
					<CalendarDays size={16} />
					<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
				</div>
			</div>
			<div className="field">
				<label>Check-out</label>
				<div className="with-icon">
					<CalendarDays size={16} />
					<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
				</div>
			</div>
			<div className="field">
				<label>Room type</label>
				<select value={roomType} onChange={(event) => setRoomType(event.target.value)}>
					<option value="all">All rooms</option>
					{roomTypes.map((room) => (
						<option key={`${room.roomType}-${room.displayName || room._id}`} value={room.roomType}>
							{room.displayName || roomTypeLabel(room.roomType)}
						</option>
					))}
				</select>
			</div>
			<div className="people-fields">
				<div className="field">
					<label>Adults</label>
					<div className="with-icon">
						<Users size={16} />
						<input min="1" type="number" value={adults} onChange={(event) => setAdults(event.target.value)} />
					</div>
				</div>
				<div className="field">
					<label>Children</label>
					<input min="0" type="number" value={children} onChange={(event) => setChildren(event.target.value)} placeholder="0" />
				</div>
			</div>
			<button className="btn btn-primary" type="submit">
				<Search size={18} />
				Search
			</button>
			<style jsx>{`
				.search-panel {
					position: relative;
					z-index: 4;
					display: grid;
					grid-template-columns: 1.25fr 1fr 1fr 1fr 0.95fr auto;
					gap: 12px;
					align-items: end;
					padding: 16px;
					border: 1px solid rgba(255, 255, 255, 0.52);
					border-radius: 8px;
					background: rgba(255, 255, 255, 0.92);
					box-shadow: var(--zad-shadow);
					backdrop-filter: blur(18px);
				}

				.search-panel.compact {
					box-shadow: none;
					border: 1px solid var(--zad-border);
					background: #fff;
				}

				.with-icon {
					position: relative;
				}

				.with-icon :global(svg) {
					position: absolute;
					left: 10px;
					top: 50%;
					transform: translateY(-50%);
					color: var(--zad-grey);
					pointer-events: none;
				}

				.with-icon input {
					padding-left: 34px;
				}

				.people-fields {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 8px;
				}

				.btn {
					min-width: 126px;
				}

				@media (max-width: 1040px) {
					.search-panel {
						grid-template-columns: repeat(2, minmax(0, 1fr));
					}
				}

				@media (max-width: 620px) {
					.search-panel {
						grid-template-columns: 1fr;
						padding: 12px;
					}
				}
			`}</style>
		</form>
	);
}
