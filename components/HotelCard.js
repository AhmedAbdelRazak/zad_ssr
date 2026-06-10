"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { DEFAULT_HERO_IMAGE } from "../lib/constants";
import { firstImage, hotelLocation, sar, slugifyHotel, titleCase, walkingDistance } from "../lib/format";

const minBasePrice = (hotel = {}) => {
	const prices = (hotel.roomCountDetails || [])
		.map((room) => Number(room?.price?.basePrice || 0))
		.filter((price) => price > 0);
	return prices.length ? Math.min(...prices) : 0;
};

export default function HotelCard({ hotel = {}, priority = false }) {
	const image = firstImage(hotel.hotelPhotos, hotel.roomCountDetails?.[0]?.photos, DEFAULT_HERO_IMAGE);
	const slug = slugifyHotel(hotel.hotelName);
	const price = minBasePrice(hotel);

	return (
		<article className="hotel-card">
			<Link href={`/single-hotel/${slug}`} className="image-wrap" aria-label={`View ${hotel.hotelName}`}>
				<img src={image} alt={hotel.hotelName || "ZAD hotel"} loading={priority ? "eager" : "lazy"} />
			</Link>
			<div className="content">
				<div className="rating">
					<Star size={15} fill="currentColor" />
					<span>{Number(hotel.hotelRating || 0).toFixed(1)}</span>
				</div>
				<h3>
					<Link href={`/single-hotel/${slug}`}>{titleCase(hotel.hotelName)}</Link>
				</h3>
				<p className="location">
					<MapPin size={15} />
					{hotelLocation(hotel) || "Saudi Arabia"}
				</p>
				{walkingDistance(hotel) ? <p className="distance">{walkingDistance(hotel)} to Al Haram</p> : null}
				<div className="card-bottom">
					<div>
						<span>From</span>
						<strong>{sar(price)}</strong>
					</div>
					<Link href={`/single-hotel/${slug}`} className="view-link">
						View
						<ArrowRight size={16} />
					</Link>
				</div>
			</div>
			<style jsx>{`
				.hotel-card {
					background: #fff;
					border: 1px solid var(--zad-border);
					border-radius: 8px;
					overflow: hidden;
					box-shadow: 0 14px 32px rgba(8, 9, 13, 0.07);
					display: flex;
					flex-direction: column;
					min-height: 100%;
				}

				.image-wrap {
					display: block;
					aspect-ratio: 1.42;
					background: #eceff4;
					overflow: hidden;
				}

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					transition: transform 240ms ease;
				}

				.hotel-card:hover img {
					transform: scale(1.035);
				}

				.content {
					padding: 16px;
					display: flex;
					flex-direction: column;
					gap: 10px;
					flex: 1;
				}

				.rating {
					width: fit-content;
					display: inline-flex;
					align-items: center;
					gap: 5px;
					color: #fff;
					background: linear-gradient(135deg, var(--zad-blue), var(--zad-green));
					border-radius: 999px;
					padding: 5px 9px;
					font-size: 12px;
					font-weight: 900;
				}

				h3 {
					margin: 0;
					font-size: 20px;
					line-height: 1.2;
				}

				.location,
				.distance {
					margin: 0;
					color: var(--zad-grey);
					line-height: 1.45;
					font-size: 14px;
				}

				.location {
					display: flex;
					align-items: center;
					gap: 6px;
				}

				.card-bottom {
					display: flex;
					align-items: end;
					justify-content: space-between;
					gap: 12px;
					margin-top: auto;
					padding-top: 8px;
				}

				.card-bottom span {
					display: block;
					color: var(--zad-grey);
					font-size: 12px;
					font-weight: 800;
				}

				.card-bottom strong {
					font-size: 18px;
				}

				.view-link {
					color: var(--zad-blue);
					font-weight: 950;
					display: inline-flex;
					align-items: center;
					gap: 5px;
				}
			`}</style>
		</article>
	);
}
