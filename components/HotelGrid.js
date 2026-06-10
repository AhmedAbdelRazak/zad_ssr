"use client";

import HotelCard from "./HotelCard";

export default function HotelGrid({ hotels = [], limit, emptyText = "No hotels are available yet." }) {
	const rows = Array.isArray(hotels) ? hotels.slice(0, limit || hotels.length) : [];
	if (!rows.length) return <div className="empty-state">{emptyText}</div>;
	return (
		<div className="hotel-grid">
			{rows.map((hotel, index) => (
				<HotelCard key={hotel._id || hotel.hotelName} hotel={hotel} priority={index < 2} />
			))}
			<style jsx>{`
				.hotel-grid {
					display: grid;
					grid-template-columns: repeat(3, minmax(0, 1fr));
					gap: 18px;
				}

				@media (max-width: 980px) {
					.hotel-grid {
						grid-template-columns: repeat(2, minmax(0, 1fr));
					}
				}

				@media (max-width: 620px) {
					.hotel-grid {
						grid-template-columns: 1fr;
					}
				}
			`}</style>
		</div>
	);
}
