"use client";

import OptimizedImage from "./OptimizedImage";
import { useZadApp } from "./ZadAppProvider";

export default function PageHero({
	eyebrow,
	title,
	copy,
	eyebrowAr,
	titleAr,
	copyAr,
	image,
	className = "",
}) {
	const { isArabic } = useZadApp();
	const hasImage = Boolean(image);
	return (
		<section
			className={`page-hero ${hasImage ? "image-hero" : ""} ${className}`}
			dir={isArabic ? "rtl" : "ltr"}
		>
			{hasImage ? (
				<OptimizedImage
					className="page-hero-media"
					src={image}
					alt=""
					fill
					priority
					sizes="100vw"
					quality={80}
					aria-hidden="true"
				/>
			) : null}
			{hasImage ? <div className="page-hero-shade" /> : null}
			<div className="container">
				<p className="eyebrow">{isArabic ? eyebrowAr || eyebrow : eyebrow}</p>
				<h1>{isArabic ? titleAr || title : title}</h1>
				<p>{isArabic ? copyAr || copy : copy}</p>
			</div>
		</section>
	);
}
