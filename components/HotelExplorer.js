"use client";

import { useMemo, useState } from "react";
import HotelGrid from "./HotelGrid";
import { titleCase, walkingDistance } from "../lib/format";

const parseDistance = (value = "") => {
	const text = String(value || "").toLowerCase();
	let minutes = 0;
	const day = text.match(/(\d+)\s*day/);
	const hour = text.match(/(\d+)\s*hour/);
	const min = text.match(/(\d+)\s*min/);
	if (day) minutes += Number(day[1]) * 1440;
	if (hour) minutes += Number(hour[1]) * 60;
	if (min) minutes += Number(min[1]);
	return minutes || Number.MAX_SAFE_INTEGER;
};

const minPrice = (hotel = {}) => {
	const prices = (hotel.roomCountDetails || [])
		.map((room) => Number(room?.price?.basePrice || 0))
		.filter(Boolean);
	return prices.length ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
};

export default function HotelExplorer({ hotels = [] }) {
	const destinations = useMemo(() => {
		const values = new Set(["All"]);
		hotels.forEach((hotel) => {
			if (hotel.hotelCity) values.add(titleCase(hotel.hotelCity));
			if (hotel.hotelState) values.add(titleCase(hotel.hotelState));
		});
		return [...values];
	}, [hotels]);
	const [query, setQuery] = useState("");
	const [destination, setDestination] = useState("All");
	const [sort, setSort] = useState("recommended");

	const filtered = useMemo(() => {
		const cleanQuery = query.trim().toLowerCase();
		const cleanDestination = destination.toLowerCase();
		return [...hotels]
			.filter((hotel) => {
				const haystack = [
					hotel.hotelName,
					hotel.hotelCity,
					hotel.hotelState,
					hotel.hotelCountry,
					hotel.hotelAddress,
				]
					.filter(Boolean)
					.join(" ")
					.toLowerCase();
				const matchesQuery = !cleanQuery || haystack.includes(cleanQuery);
				const matchesDestination =
					destination === "All" ||
					[hotel.hotelCity, hotel.hotelState, hotel.hotelCountry, hotel.hotelAddress]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
						.includes(cleanDestination);
				return matchesQuery && matchesDestination;
			})
			.sort((first, second) => {
				if (sort === "price") return minPrice(first) - minPrice(second);
				if (sort === "distance") return parseDistance(walkingDistance(first)) - parseDistance(walkingDistance(second));
				return Number(second.hotelRating || 0) - Number(first.hotelRating || 0);
			});
	}, [destination, hotels, query, sort]);

	return (
		<div className="explorer">
			<div className="toolbar">
				<div className="field">
					<label>Search hotels</label>
					<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hotel name, city, or area" />
				</div>
				<div className="field">
					<label>Destination</label>
					<select value={destination} onChange={(event) => setDestination(event.target.value)}>
						{destinations.map((item) => (
							<option key={item} value={item}>
								{item}
							</option>
						))}
					</select>
				</div>
				<div className="field">
					<label>Sort</label>
					<select value={sort} onChange={(event) => setSort(event.target.value)}>
						<option value="recommended">Recommended</option>
						<option value="distance">Closest to Al Haram</option>
						<option value="price">Lowest price</option>
					</select>
				</div>
			</div>
			<div className="result-count">{filtered.length} hotels</div>
			<HotelGrid hotels={filtered} emptyText="No Zad hotels match this filter yet." />
			<style jsx>{`
				.explorer {
					display: grid;
					gap: 18px;
				}

				.toolbar {
					display: grid;
					grid-template-columns: 1.5fr 1fr 1fr;
					gap: 12px;
					padding: 14px;
					background: #fff;
					border: 1px solid var(--zad-border);
					border-radius: 8px;
				}

				.result-count {
					font-weight: 900;
					color: var(--zad-grey);
				}

				@media (max-width: 760px) {
					.toolbar {
						grid-template-columns: 1fr;
					}
				}
			`}</style>
		</div>
	);
}
