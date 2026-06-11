import { ROOM_TYPE_LABELS } from "./constants";

export const slugifyHotel = (name = "") =>
	encodeURIComponent(
		String(name || "")
			.trim()
			.replace(/\s+/g, "-")
			.toLowerCase()
	);

export const titleCase = (value = "") =>
	String(value || "")
		.replace(/[-_]+/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.toLowerCase()
		.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

export const roomTypeLabel = (roomType = "") =>
	ROOM_TYPE_LABELS[roomType] || titleCase(roomType || "Room");

export const sar = (value = 0) => {
	const amount = Number(value || 0);
	if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "SAR",
		maximumFractionDigits: 0,
	}).format(amount);
};

export const stripHtml = (value = "") =>
	String(value || "")
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

export const firstImage = (...candidates) => {
	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate) return candidate;
		if (candidate?.url) return candidate.url;
		if (Array.isArray(candidate) && candidate[0]?.url) return candidate[0].url;
	}
	return "";
};

export const hotelLocation = (hotel = {}) =>
	[hotel.hotelCity, hotel.hotelState, hotel.hotelCountry]
		.filter(Boolean)
		.map(titleCase)
		.join(", ");

const distanceValue = (value) => {
	const text = String(value ?? "").trim();
	if (!text || text === "0" || /^n\/?a$/i.test(text)) return "";
	if (/^\d+(\.\d+)?$/.test(text)) return `${text} min`;
	return text;
};

export const walkingDistanceOnly = (hotel = {}) =>
	distanceValue(hotel?.distances?.walkingToElHaram);

export const drivingDistance = (hotel = {}) =>
	distanceValue(hotel?.distances?.drivingToElHaram);

export const walkingDistance = (hotel = {}) =>
	walkingDistanceOnly(hotel) || drivingDistance(hotel) || "";
