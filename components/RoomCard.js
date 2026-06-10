"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "../lib/constants";
import { firstImage, roomTypeLabel, sar, slugifyHotel, titleCase } from "../lib/format";

export default function RoomCard({ hotel = {}, room = {}, whatsappNumber = WHATSAPP_NUMBER }) {
	const image = firstImage(room.photos, hotel.hotelPhotos);
	const roomName = room.displayName || roomTypeLabel(room.roomType);
	const hotelName = titleCase(hotel.hotelName);
	const message = encodeURIComponent(`Hello ZAD Hotels, I am interested in ${roomName} at ${hotelName}.`);

	return (
		<article className="room-card">
			{image ? <img src={image} alt={`${roomName} at ${hotelName}`} loading="lazy" /> : null}
			<div className="room-content">
				<span>{hotelName}</span>
				<h3>{roomName}</h3>
				<p>{room.description || "Comfortable room option with hotel support available for booking details."}</p>
				<div className="room-meta">
					<strong>{sar(room?.price?.basePrice)}</strong>
					{room.bedsCount ? <small>{room.bedsCount} beds</small> : null}
				</div>
				<div className="room-actions">
					<Link className="btn btn-ghost" href={`/single-hotel/${slugifyHotel(hotel.hotelName)}`}>
						Hotel details
					</Link>
					<a className="btn btn-primary" href={`https://wa.me/${whatsappNumber}?text=${message}`} target="_blank" rel="noreferrer">
						<MessageCircle size={17} />
						Ask to book
					</a>
				</div>
			</div>
			<style jsx>{`
				.room-card {
					display: grid;
					grid-template-columns: 220px 1fr;
					background: #fff;
					border: 1px solid var(--zad-border);
					border-radius: 8px;
					overflow: hidden;
				}

				img {
					width: 100%;
					height: 100%;
					min-height: 190px;
					object-fit: cover;
				}

				.room-content {
					padding: 16px;
				}

				span {
					color: var(--zad-green);
					font-size: 12px;
					font-weight: 950;
					text-transform: uppercase;
				}

				h3 {
					margin: 5px 0 8px;
					font-size: 22px;
				}

				p {
					margin: 0;
					color: var(--zad-grey);
					line-height: 1.6;
				}

				.room-meta {
					display: flex;
					align-items: baseline;
					gap: 12px;
					margin-top: 14px;
				}

				.room-meta strong {
					font-size: 20px;
				}

				.room-meta small {
					color: var(--zad-grey);
					font-weight: 800;
				}

				.room-actions {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					margin-top: 16px;
				}

				.btn-ghost {
					border-color: var(--zad-border);
				}

				@media (max-width: 720px) {
					.room-card {
						grid-template-columns: 1fr;
					}
				}
			`}</style>
		</article>
	);
}
