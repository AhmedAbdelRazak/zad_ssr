import { DEFAULT_HERO_IMAGES, DEFAULT_LOGO } from "./constants";

const API_BASE =
	process.env.NEXT_PUBLIC_API_URL ||
	process.env.API_URL ||
	"https://xhotelpro.com/api";

const normalizePath = (path = "") => (path.startsWith("/") ? path : `/${path}`);

export const apiUrl = (path = "") => `${API_BASE}${normalizePath(path)}`;

async function fetchJson(path, { revalidate = 60 } = {}) {
	try {
		const res = await fetch(apiUrl(path), {
			next: { revalidate },
			headers: { Accept: "application/json" },
		});
		const contentType = res.headers.get("content-type") || "";
		if (!contentType.includes("application/json")) return null;
		const text = await res.text();
		const data = text ? JSON.parse(text) : null;
		if (!res.ok) return null;
		return data;
	} catch (error) {
		console.error(`Zad API fetch failed for ${path}:`, error);
		return null;
	}
}

export const websiteDefaults = {
	siteName: "ZAD Hotels",
	janatLogo: { url: DEFAULT_LOGO },
	homeMainBanners: DEFAULT_HERO_IMAGES.map((url, index) => ({
		url,
		title:
			index === 0
				? "ZAD Hotels"
				: index === 1
					? "Stay With Confidence"
					: "Designed Around Your Trip",
		subTitle:
			index === 0
				? "Classy stays, thoughtful service, and hotels selected for comfort."
				: index === 1
					? "Browse available rooms and book your next stay with ease."
					: "Find the room type and hotel setting that fits your plans.",
		buttonTitle: index === 2 ? "View Rooms" : "Explore Hotels",
		pageRedirectURL: index === 2 ? "/rooms" : "/our-hotels",
		btnBackgroundColor: ["#0a8f82", "#2557c7", "#7b3fb3"][index],
	})),
	homeSecondBanner: { url: DEFAULT_HERO_IMAGES[1] },
	homeThirdBanner: { url: DEFAULT_HERO_IMAGES[2] },
	aboutUsBanner: { url: DEFAULT_HERO_IMAGES[1] },
	contactUsBanner: { url: DEFAULT_HERO_IMAGES[0] },
	aboutUsEnglish:
		"<h1>ZAD Hotels</h1><p>ZAD Hotels brings together a carefully selected hotel collection with a focus on comfort, service, and smooth booking experiences.</p>",
	contactEmail: "contact@zadhotels.com",
	officialEmail: "official@zadhotels.com",
	phone: "+966 54 779 3608",
	whatsappNumber: "966547793608",
};

export async function getWebsite() {
	const data = await fetchJson("/zad-website-document", { revalidate: 120 });
	const doc = Array.isArray(data) ? data[data.length - 1] : data;
	return { ...websiteDefaults, ...(doc || {}) };
}

export async function getHotels() {
	const data = await fetchJson("/zad/active-hotel-list", { revalidate: 60 });
	return Array.isArray(data) ? data : [];
}

export async function getFeaturedHotels() {
	const data = await fetchJson("/zad/active-hotels", { revalidate: 60 });
	return Array.isArray(data) ? data : [];
}

export async function getRoomTypes() {
	const data = await fetchJson("/zad/distinct-rooms", { revalidate: 120 });
	return Array.isArray(data) ? data : [];
}

export async function getHotelBySlug(slug) {
	return fetchJson(`/zad/single-hotel/${encodeURIComponent(slug)}`, {
		revalidate: 60,
	});
}

export async function getRoomSearchResults(query) {
	const data = await fetchJson(`/zad/room-query-list/${encodeURIComponent(query)}`, {
		revalidate: 30,
	});
	return Array.isArray(data) ? data : [];
}

export async function getDealHotels() {
	const data = await fetchJson("/zad/hotels/active-with-deals", {
		revalidate: 60,
	});
	return Array.isArray(data) ? data : [];
}
