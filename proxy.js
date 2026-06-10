import { NextResponse } from "next/server";

const PUBLIC_HOST = "zadhotels.jannatbooking.com";
const HSTS_VALUE = "max-age=31536000";

const readScheme = (request) => {
	const forwarded = request.headers.get("x-forwarded-proto");
	if (forwarded) return forwarded.split(",")[0].trim().toLowerCase();

	const cfVisitor = request.headers.get("cf-visitor");
	if (!cfVisitor) return "";

	try {
		const parsed = JSON.parse(cfVisitor);
		return String(parsed?.scheme || "").toLowerCase();
	} catch (_error) {
		return cfVisitor.includes("http") ? "http" : "";
	}
};

export function proxy(request) {
	const host = String(request.headers.get("host") || "")
		.split(":")[0]
		.toLowerCase();

	if (host !== PUBLIC_HOST) {
		return NextResponse.next();
	}

	if (readScheme(request) === "http") {
		const secureUrl = request.nextUrl.clone();
		secureUrl.protocol = "https";
		secureUrl.hostname = PUBLIC_HOST;
		secureUrl.port = "";
		return NextResponse.redirect(secureUrl, 308);
	}

	const response = NextResponse.next();
	response.headers.set("Strict-Transport-Security", HSTS_VALUE);
	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
