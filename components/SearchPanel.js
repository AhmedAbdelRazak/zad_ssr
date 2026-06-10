"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DatePicker, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { CalendarDays, Search, Users } from "lucide-react";
import { roomTypeLabel, titleCase } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const dateOffset = (days) => dayjs().add(days, "day").format("YYYY-MM-DD");

export default function SearchPanel({ hotels = [], roomTypes = [], compact = false, defaults = {} }) {
	const router = useRouter();
	const { t, isArabic } = useZadApp();
	const destinations = useMemo(() => {
		const values = new Set([{ label: t("all"), value: "All" }]);
		const seen = new Set(["All"]);
		hotels.forEach((hotel) => {
			[hotel.hotelCity, hotel.hotelState].filter(Boolean).forEach((item) => {
				const label = titleCase(item);
				if (!seen.has(label)) {
					seen.add(label);
					values.add({ label, value: label });
				}
			});
		});
		return [...values];
	}, [hotels, t]);

	const [destination, setDestination] = useState(defaults.destination || "All");
	const [dateRange, setDateRange] = useState([
		dayjs(defaults.startDate || dateOffset(1)),
		dayjs(defaults.endDate || dateOffset(4)),
	]);
	const [roomType, setRoomType] = useState(defaults.roomType || "all");
	const [adults, setAdults] = useState(Number(defaults.adults || 1));
	const [children, setChildren] = useState(Number(defaults.children || 0));

	const submit = (event) => {
		event.preventDefault();
		const startDate = dateRange?.[0]?.format("YYYY-MM-DD") || dateOffset(1);
		const endDate = dateRange?.[1]?.format("YYYY-MM-DD") || dateOffset(4);
		const params = new URLSearchParams({
			destination,
			startDate,
			endDate,
			roomType,
			adults: String(adults || 1),
			children: String(children || 0),
		});
		router.push(`/rooms?${params.toString()}`);
	};

	const roomOptions = [
		{ label: t("allRooms"), value: "all" },
		...roomTypes.map((room) => ({
			label: room.displayName || roomTypeLabel(room.roomType),
			value: room.roomType,
		})),
	];

	return (
		<form className={`search-panel ${compact ? "compact" : ""}`} onSubmit={submit} dir={isArabic ? "rtl" : "ltr"}>
			<div className="search-field destination-field">
				<label>{t("destination")}</label>
				<Select value={destination} options={destinations} onChange={setDestination} />
			</div>
			<div className="search-field date-field">
				<label>{t("checkIn")} / {t("checkOut")}</label>
				<DatePicker.RangePicker
					value={dateRange}
					onChange={(value) => setDateRange(value || [])}
					suffixIcon={<CalendarDays size={16} />}
					allowClear={false}
				/>
			</div>
			<div className="search-field">
				<label>{t("roomType")}</label>
				<Select value={roomType} options={roomOptions} onChange={setRoomType} />
			</div>
			<div className="people-fields">
				<div className="search-field">
					<label>{t("adults")}</label>
					<InputNumber min={1} max={20} value={adults} onChange={(value) => setAdults(Number(value || 1))} prefix={<Users size={15} />} />
				</div>
				<div className="search-field">
					<label>{t("children")}</label>
					<InputNumber min={0} max={20} value={children} onChange={(value) => setChildren(Number(value || 0))} />
				</div>
			</div>
			<Button type="primary" htmlType="submit" size="large" icon={<Search size={18} />} className="search-submit">
				{t("search")}
			</Button>
		</form>
	);
}
