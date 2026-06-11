"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, DatePicker, InputNumber, Select } from "antd";
import dayjs from "dayjs";
import { CalendarDays, Search, Users } from "lucide-react";
import { roomTypeLabel, titleCase } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

const dateOffset = (days) => dayjs().add(days, "day").format("YYYY-MM-DD");
const parseDate = (value, fallbackDays) => {
	const parsed = dayjs(value || dateOffset(fallbackDays));
	return parsed.isValid() ? parsed : dayjs(dateOffset(fallbackDays));
};

export default function SearchPanel({ hotels = [], roomTypes = [], compact = false, defaults = {} }) {
	const router = useRouter();
	const { t, isArabic, language } = useZadApp();
	const labels = {
		heading: isArabic
			? "\u062f\u0639\u0646\u0627 \u0646\u0633\u0627\u0639\u062f\u0643 \u0641\u064a \u0625\u064a\u062c\u0627\u062f \u0645\u0627 \u062a\u062d\u062a\u0627\u062c\u0647"
			: "Let us help you find what you need",
		city: isArabic ? "\u0627\u0644\u0645\u062f\u064a\u0646\u0629" : "CITY",
		from: isArabic ? "\u0645\u0646" : "FROM",
		to: isArabic ? "\u0625\u0644\u0649" : "TO",
		guests: isArabic ? "\u0627\u0644\u0636\u064a\u0648\u0641" : "GUESTS",
		selectDestination: isArabic
			? "\u0627\u062e\u062a\u0631 \u0648\u062c\u0647\u062a\u0643"
			: "Choose destination",
		selectDate: isArabic ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0627\u0631\u064a\u062e" : "Select date",
	};
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
	const [checkIn, setCheckIn] = useState(parseDate(defaults.startDate, 1));
	const [checkOut, setCheckOut] = useState(() => {
		const start = parseDate(defaults.startDate, 1);
		const end = parseDate(defaults.endDate, 4);
		return end.isAfter(start, "day") ? end : start.add(1, "day");
	});
	const [roomType, setRoomType] = useState(defaults.roomType || "all");
	const [adults, setAdults] = useState(Number(defaults.adults || 1));
	const [children] = useState(Number(defaults.children || 0));

	const handleCheckInChange = (value) => {
		const nextCheckIn = value || parseDate(null, 1);
		setCheckIn(nextCheckIn);
		setCheckOut((current) =>
			current && current.isAfter(nextCheckIn, "day")
				? current
				: nextCheckIn.add(1, "day")
		);
	};

	const handleCheckOutChange = (value) => {
		const minCheckout = checkIn.add(1, "day");
		setCheckOut(value && value.isAfter(checkIn, "day") ? value : minCheckout);
	};

	const disabledCheckInDate = (current) => current && current < dayjs().endOf("day");
	const disabledCheckOutDate = (current) =>
		current && current < checkIn.add(1, "day").startOf("day");

	const submit = (event) => {
		event.preventDefault();
		const startDate = checkIn?.format("YYYY-MM-DD") || dateOffset(1);
		const endDate =
			checkOut && checkOut.isAfter(checkIn, "day")
				? checkOut.format("YYYY-MM-DD")
				: checkIn.add(1, "day").format("YYYY-MM-DD");
		const params = new URLSearchParams({
			destination,
			startDate,
			endDate,
			roomType,
			adults: String(adults || 1),
			children: String(children || 0),
			lang: language,
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
			<h3 className="search-panel-heading">{labels.heading}</h3>
			<div className="search-panel-row">
				<div className="search-field destination-field">
					<label>{labels.city}</label>
					<Select
						value={destination}
						options={destinations}
						onChange={setDestination}
						placeholder={labels.selectDestination}
						popupClassName="zad-search-dropdown"
					/>
				</div>
				<div className="search-field">
					<label>{labels.from}</label>
					<DatePicker
						value={checkIn}
						onChange={handleCheckInChange}
						disabledDate={disabledCheckInDate}
						suffixIcon={<CalendarDays size={16} />}
						allowClear={false}
						inputReadOnly
						format="YYYY-MM-DD"
						placeholder={labels.selectDate}
					/>
				</div>
				<div className="search-field">
					<label>{labels.to}</label>
					<DatePicker
						value={checkOut}
						onChange={handleCheckOutChange}
						disabledDate={disabledCheckOutDate}
						suffixIcon={<CalendarDays size={16} />}
						allowClear={false}
						inputReadOnly
						format="YYYY-MM-DD"
						placeholder={labels.selectDate}
					/>
				</div>
			</div>
			<div className="search-panel-row">
				<div className="search-field">
					<label>{t("roomType")}</label>
					<Select
						value={roomType}
						options={roomOptions}
						onChange={setRoomType}
						popupClassName="zad-search-dropdown"
					/>
				</div>
				<div className="search-field">
					<label>{labels.guests}</label>
					<InputNumber
						min={1}
						max={20}
						value={adults}
						onChange={(value) => setAdults(Number(value || 1))}
						prefix={<Users size={15} />}
						controls={false}
						dir="ltr"
						className="guest-input"
					/>
				</div>
				<div className="search-submit-wrap">
					<Button type="primary" htmlType="submit" size="large" icon={<Search size={18} />} className="search-submit">
						{t("search")}
					</Button>
				</div>
			</div>
		</form>
	);
}
