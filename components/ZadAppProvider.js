"use client";

import { ConfigProvider } from "antd";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, getText } from "../lib/i18n";

const ZadAppContext = createContext(null);
const LANGUAGE_KEY = "zadHotelsLanguage";
const CART_KEY = "zadHotelsCart";

const dateOffset = (days) => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

const normalizeItem = (item = {}) => {
	const checkIn = item.checkIn || dateOffset(1);
	const checkOut = item.checkOut || dateOffset(4);
	const amount = Math.max(1, Number(item.amount || 1));
	const price = Math.max(0, Number(item.price || 0));
	return {
		id: String(item.id || `${item.hotelId || "hotel"}-${item.roomType || "room"}`),
		hotelId: item.hotelId || "",
		hotelName: item.hotelName || "ZAD Hotel",
		hotelSlug: item.hotelSlug || "",
		roomId: item.roomId || "",
		roomType: item.roomType || "",
		roomName: item.roomName || "Room",
		image: item.image || "",
		price,
		amount,
		checkIn,
		checkOut,
	};
};

const nightsBetween = (start, end) => {
	const startDate = new Date(`${start}T00:00:00`);
	const endDate = new Date(`${end}T00:00:00`);
	const diff = Math.round((endDate - startDate) / 86400000);
	return Math.max(1, Number.isFinite(diff) ? diff : 1);
};

export function ZadAppProvider({ children }) {
	const [language, setLanguage] = useState("en");
	const [cart, setCart] = useState([]);
	const [cartOpen, setCartOpen] = useState(false);

	useEffect(() => {
		const storedLanguage = window.localStorage.getItem(LANGUAGE_KEY);
		if (storedLanguage === "ar" || storedLanguage === "en") {
			setLanguage(storedLanguage);
		}
		try {
			const storedCart = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
			if (Array.isArray(storedCart)) setCart(storedCart.map(normalizeItem));
		} catch (_error) {
			setCart([]);
		}
	}, []);

	useEffect(() => {
		window.localStorage.setItem(LANGUAGE_KEY, language);
		document.documentElement.lang = language;
		document.documentElement.dir = LANGUAGES[language]?.dir || "ltr";
	}, [language]);

	useEffect(() => {
		window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
	}, [cart]);

	const toggleLanguage = useCallback(() => {
		setLanguage((current) => (current === "ar" ? "en" : "ar"));
	}, []);

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

	const updateCartItem = useCallback((id, patch = {}) => {
		setCart((current) =>
			current.map((item) => (item.id === id ? normalizeItem({ ...item, ...patch }) : item))
		);
	}, []);

	const removeCartItem = useCallback((id) => {
		setCart((current) => current.filter((item) => item.id !== id));
	}, []);

	const clearCart = useCallback(() => setCart([]), []);

	const totals = useMemo(() => {
		return cart.reduce(
			(acc, item) => {
				const nights = nightsBetween(item.checkIn, item.checkOut);
				const quantity = Number(item.amount || 1);
				const lineTotal = Number(item.price || 0) * quantity * nights;
				acc.rooms += quantity;
				acc.nights = Math.max(acc.nights, nights);
				acc.amount += lineTotal;
				return acc;
			},
			{ rooms: 0, nights: 0, amount: 0 }
		);
	}, [cart]);

	const value = useMemo(
		() => ({
			language,
			isArabic: language === "ar",
			direction: LANGUAGES[language]?.dir || "ltr",
			t: (key) => getText(language, key),
			toggleLanguage,
			setLanguage,
			cart,
			totals,
			cartOpen,
			setCartOpen,
			addToCart,
			updateCartItem,
			removeCartItem,
			clearCart,
			nightsBetween,
		}),
		[
			addToCart,
			cart,
			cartOpen,
			clearCart,
			language,
			removeCartItem,
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
