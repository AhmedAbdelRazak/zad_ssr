"use client";

import { ConfigProvider } from "antd";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import dayjs from "dayjs";
import { buildRoomPricing, cartRoomsCount, cartTotal, defaultGuestPaymentAcceptance, generateDateRange, safeNumber } from "../lib/booking";
import { LANGUAGES, getText } from "../lib/i18n";
import { addLanguageToHref, languageFromSearch, normalizeLanguage } from "../lib/language";

const ZadAppContext = createContext(null);
const LANGUAGE_KEY = "zadHotelsLanguage";
const CART_KEY = "zadHotelsCart";
const AUTH_KEY = "zadHotelsAuth";

const dateOffset = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

const normalizeCartDate = (value, fallback) => {
	const date = dayjs(value);
	return date.isValid() ? date.format("YYYY-MM-DD") : fallback;
};

const pricingRowsMatchDates = (rows = [], dates = []) =>
	Array.isArray(rows) &&
	rows.length === dates.length &&
	rows.every((row, index) => String(row?.date || row?.calendarDate || "").slice(0, 10) === dates[index]);

const cartItemMatches = (item = {}, id, match = {}) => {
	if (item.id !== id) return false;
	if (match.checkIn && item.checkIn !== match.checkIn) return false;
	if (match.checkOut && item.checkOut !== match.checkOut) return false;
	return true;
};

const mergeCartItems = (items = []) => {
	const merged = [];
	items.map(normalizeItem).forEach((item) => {
		const index = merged.findIndex(
			(row) => row.id === item.id && row.checkIn === item.checkIn && row.checkOut === item.checkOut
		);
		if (index === -1) {
			merged.push(item);
			return;
		}
		merged[index] = {
			...merged[index],
			amount: Math.min(20, Number(merged[index].amount || 1) + Number(item.amount || 1)),
		};
	});
	return merged;
};

const normalizeItem = (item = {}) => {
	const checkIn = normalizeCartDate(item.checkIn, dateOffset(1));
	const rawCheckOut = normalizeCartDate(item.checkOut, dateOffset(4));
	const checkOut = dayjs(rawCheckOut).isAfter(dayjs(checkIn))
		? rawCheckOut
		: dayjs(checkIn).add(1, "day").format("YYYY-MM-DD");
	const amount = Math.max(1, Number(item.amount || 1));
	const price = Math.max(0, Number(item.price || 0));
	const defaultCost = safeNumber(item.defaultCost, price);
	const roomCommission = safeNumber(item.roomCommission, 10);
	const pricingRate = Array.isArray(item.pricingRate) ? item.pricingRate : [];
	const storedPricingByDay = Array.isArray(item.pricingByDay) ? item.pricingByDay : [];
	const storedPricingByDayWithCommission = Array.isArray(item.pricingByDayWithCommission)
		? item.pricingByDayWithCommission
		: storedPricingByDay;
	const dateRange = generateDateRange(checkIn, checkOut);
	const shouldReusePricing =
		pricingRowsMatchDates(storedPricingByDayWithCommission, dateRange) &&
		pricingRowsMatchDates(storedPricingByDay.length ? storedPricingByDay : storedPricingByDayWithCommission, dateRange);
	const recalculatedPricing = shouldReusePricing
		? {
				pricingByDay: storedPricingByDay.length ? storedPricingByDay : storedPricingByDayWithCommission,
				pricingByDayWithCommission: storedPricingByDayWithCommission,
			}
		: buildRoomPricing(
				{
					...item,
					price: { basePrice: price },
					defaultCost,
					roomCommission,
					pricingRate,
				},
				checkIn,
				checkOut
			);
	return {
		id: String(item.id || `${item.hotelId || "hotel"}-${item.roomType || "room"}`),
		hotelId: item.hotelId || "",
		hotelName: item.hotelName || "ZAD Hotel",
		hotelSlug: item.hotelSlug || "",
		belongsTo: item.belongsTo || item.ownerId || "",
		hotelAddress: item.hotelAddress || "",
		hotelCity: item.hotelCity || "",
		hotelState: item.hotelState || "",
		hotelCountry: item.hotelCountry || "",
		guestPaymentAcceptance: item.guestPaymentAcceptance || defaultGuestPaymentAcceptance,
		roomId: item.roomId || "",
		roomType: item.roomType || "",
		roomName: item.roomName || "Room",
		roomNameOtherLanguage: item.roomNameOtherLanguage || "",
		roomColor: item.roomColor || "",
		defaultCost,
		roomCommission,
		bedsCount: safeNumber(item.bedsCount, 0),
		adults: Math.max(1, safeNumber(item.adults, 1)),
		children: Math.max(0, safeNumber(item.children, 0)),
		photos: Array.isArray(item.photos) ? item.photos : item.image ? [{ url: item.image }] : [],
		image: item.image || "",
		price,
		amount,
		checkIn,
		checkOut,
		pricingRate,
		pricingByDay: recalculatedPricing.pricingByDay,
		pricingByDayWithCommission: recalculatedPricing.pricingByDayWithCommission,
	};
};

const nightsBetween = (start, end) => {
	const startDate = new Date(`${start}T00:00:00`);
	const endDate = new Date(`${end}T00:00:00`);
	const diff = Math.round((endDate - startDate) / 86400000);
	return Math.max(1, Number.isFinite(diff) ? diff : 1);
};

export function ZadAppProvider({ children, initialLanguage = "en" }) {
	const pathname = usePathname();
	const normalizedInitialLanguage = normalizeLanguage(initialLanguage) || "en";
	const [language, setLanguageState] = useState(normalizedInitialLanguage);
	const [languageReady, setLanguageReady] = useState(false);
	const [syncLanguageUrl, setSyncLanguageUrl] = useState(false);
	const [cart, setCart] = useState([]);
	const [cartOpen, setCartOpen] = useState(false);
	const [auth, setAuth] = useState(null);

	useEffect(() => {
		const urlLanguage = languageFromSearch(window.location.search);
		const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
		const savedLanguage = normalizeLanguage(storedLanguage);
		const nextLanguage = urlLanguage || savedLanguage || normalizedInitialLanguage;
		setLanguageState(nextLanguage);
		setSyncLanguageUrl(Boolean(urlLanguage || savedLanguage === "ar"));
		setLanguageReady(true);
		try {
			const storedCart = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
			if (Array.isArray(storedCart)) setCart(storedCart.map(normalizeItem));
		} catch (_error) {
			setCart([]);
		}
		try {
			const storedAuth = JSON.parse(window.localStorage.getItem(AUTH_KEY) || "null");
			if (storedAuth?.token && storedAuth?.user?._id) setAuth(storedAuth);
		} catch (_error) {
			setAuth(null);
		}
	}, [normalizedInitialLanguage]);

	useEffect(() => {
		if (!languageReady) return;
		window.localStorage.setItem(LANGUAGE_KEY, language);
		document.documentElement.lang = language;
		document.documentElement.dir = LANGUAGES[language]?.dir || "ltr";
		if (syncLanguageUrl) {
			const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;
			const nextHref = addLanguageToHref(currentHref, language);
			if (nextHref !== currentHref) {
				window.history.replaceState(window.history.state, "", nextHref);
			}
		}
	}, [language, languageReady, pathname, syncLanguageUrl]);

	useEffect(() => {
		const onPopState = () => {
			const urlLanguage = languageFromSearch(window.location.search);
			if (urlLanguage) {
				setSyncLanguageUrl(true);
				setLanguageState(urlLanguage);
			}
		};
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	useEffect(() => {
		window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
	}, [cart]);

	useEffect(() => {
		if (!languageReady) return;
		if (auth?.token && auth?.user?._id) {
			window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
		} else {
			window.localStorage.removeItem(AUTH_KEY);
		}
	}, [auth, languageReady]);

	const setLanguage = useCallback((nextLanguage) => {
		setSyncLanguageUrl(true);
		setLanguageState((current) => {
			const next =
				typeof nextLanguage === "function" ? nextLanguage(current) : nextLanguage;
			return normalizeLanguage(next) || current;
		});
	}, []);

	const toggleLanguage = useCallback(() => {
		setLanguage((current) => (current === "ar" ? "en" : "ar"));
	}, [setLanguage]);

	const hrefWithLanguage = useCallback(
		(href) => addLanguageToHref(href, language),
		[language]
	);

	const addToCart = useCallback((item) => {
		const nextItem = normalizeItem(item);
		setCart((current) => {
			const index = current.findIndex(
				(row) =>
					row.id === nextItem.id &&
					row.checkIn === nextItem.checkIn &&
					row.checkOut === nextItem.checkOut
			);
			if (index === -1) return [...current, nextItem];
			return current.map((row, rowIndex) =>
				rowIndex === index
					? { ...row, amount: Math.min(20, Number(row.amount || 1) + nextItem.amount) }
					: row
			);
		});
		setCartOpen(true);
	}, []);

	const updateCartItem = useCallback((id, patch = {}, match = {}) => {
		setCart((current) =>
			mergeCartItems(
				current.map((item) =>
					cartItemMatches(item, id, match) ? normalizeItem({ ...item, ...patch }) : item
				)
			)
		);
	}, []);

	const removeCartItem = useCallback((id, match = {}) => {
		setCart((current) => current.filter((item) => !cartItemMatches(item, id, match)));
	}, []);

	const clearCart = useCallback(() => setCart([]), []);

	const setAuthSession = useCallback((session) => {
		if (session?.token && session?.user?._id) {
			setAuth({
				token: session.token,
				user: session.user,
			});
		}
	}, []);

	const signOut = useCallback(() => {
		setAuth(null);
	}, []);

	const totals = useMemo(() => {
		return {
			rooms: cartRoomsCount(cart),
			nights: cart.reduce(
				(max, item) => Math.max(max, nightsBetween(item.checkIn, item.checkOut)),
				0
			),
			amount: cartTotal(cart),
		};
	}, [cart]);

	const value = useMemo(
		() => ({
			language,
			isArabic: language === "ar",
			direction: LANGUAGES[language]?.dir || "ltr",
			t: (key) => getText(language, key),
			toggleLanguage,
			setLanguage,
			hrefWithLanguage,
			cart,
			totals,
			cartOpen,
			setCartOpen,
			auth,
			isSignedIn: Boolean(auth?.token && auth?.user?._id),
			setAuthSession,
			signOut,
			addToCart,
			updateCartItem,
			removeCartItem,
			clearCart,
			nightsBetween,
		}),
		[
			addToCart,
			auth,
			cart,
			cartOpen,
			clearCart,
			hrefWithLanguage,
			language,
			removeCartItem,
			setAuthSession,
			setLanguage,
			signOut,
			toggleLanguage,
			totals,
			updateCartItem,
		]
	);

	return (
		<ConfigProvider
			direction={value.direction}
			theme={{
				token: {
					borderRadius: 8,
					colorPrimary: "#64166e",
					colorInfo: "#17395f",
					colorSuccess: "#0f8f70",
					fontFamily:
						language === "ar"
							? '"Tajawal", "Cairo", "Noto Kufi Arabic", "Segoe UI", Arial, sans-serif'
							: '"Inter", "Segoe UI", Arial, sans-serif',
				},
			}}
		>
			<ZadAppContext.Provider value={value}>{children}</ZadAppContext.Provider>
		</ConfigProvider>
	);
}

export const useZadApp = () => {
	const context = useContext(ZadAppContext);
	if (!context) throw new Error("useZadApp must be used inside ZadAppProvider");
	return context;
};
