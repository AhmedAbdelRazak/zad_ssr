"use client";

import { titleCase } from "../lib/format";
import { useZadApp } from "./ZadAppProvider";

export default function RoomsResultsHead({ count = 0, destination = "All", startDate, endDate }) {
	const { t, isArabic } = useZadApp();
	return (
		<div className="results-head" dir={isArabic ? "rtl" : "ltr"}>
			<div>
				<p className="eyebrow">{count} {t("rooms")}</p>
				<h2>{destination === "All" ? t("all") : titleCase(destination)}</h2>
			</div>
			<p>{startDate} - {endDate}</p>
		</div>
	);
}
