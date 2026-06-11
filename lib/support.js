export const openZadSupport = ({ hotel = {}, hotelId = "", hotelName = "", message = "" } = {}) => {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent("zad:open-support", {
			detail: {
				hotelId: String(hotelId || hotel?._id || ""),
				hotelName: hotelName || hotel?.hotelName || "",
				message,
			},
		})
	);
};
