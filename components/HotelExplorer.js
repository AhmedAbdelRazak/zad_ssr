"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "antd";
import { Search } from "lucide-react";
import HotelGrid from "./HotelGrid";
import { titleCase, walkingDistance } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

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
	const { t, isArabic } = useZadApp();
	const destinations = useMemo(() => {
		const rows = [{ label: t("all"), value: "All" }];
		const seen = new Set(["All"]);
		hotels.forEach((hotel) => {
			[hotel.hotelCity, hotel.hotelState].filter(Boolean).forEach((item) => {
				const label = titleCase(item);
				if (!seen.has(label)) {
					seen.add(label);
					rows.push({ label, value: label });
				}
			});
		});
		return rows;
	}, [hotels, t]);
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
					hotel.hotelName_OtherLanguage,
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
		<div className="explorer" dir={isArabic ? "rtl" : "ltr"}>
			<div className="toolbar metallic-panel">
				<div className="search-field">
					<label>{t("hotelSearch")}</label>
					<Input
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder={t("hotelNamePlaceholder")}
						prefix={<Search size={16} />}
					/>
				</div>
				<div className="search-field">
					<label>{t("destination")}</label>
					<Select value={destination} options={destinations} onChange={setDestination} />
				</div>
				<div className="search-field">
					<label>{t("sort")}</label>
					<Select
						value={sort}
						onChange={setSort}
						options={[
							{ value: "recommended", label: t("recommended") },
							{ value: "distance", label: t("closest") },
							{ value: "price", label: t("lowestPrice") },
						]}
					/>
				</div>
			</div>
			<div className="result-count">
				{filtered.length} {isArabic ? "فنادق" : filtered.length === 1 ? "hotel" : "hotels"}
			</div>
			<HotelGrid hotels={filtered} emptyText="No Zad hotels match this filter yet." />
		</div>
	);
}
