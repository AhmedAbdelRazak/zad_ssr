import { NextResponse } from "next/server";

const PUBLIC_HOST = "zadhotels.jannatbooking.com";
const HSTS_VALUE = "max-age=31536000";

const readScheme = (request) => {
	const cfVisitor = request.headers.get("cf-visitor");
	if (cfVisitor) {
		try {
			const parsed = JSON.parse(cfVisitor);
			const scheme = String(parsed?.scheme || "").toLowerCase();
			if (scheme) return scheme;
		} catch (_error) {
			if (cfVisitor.includes('"scheme":"http"') || cfVisitor.includes('"scheme": "http"')) {
				return "http";
			}
		}
	}

	const forwarded = request.headers.get("x-forwarded-proto");
	if (forwarded) return forwarded.split(",")[0].trim().toLowerCase();

	return "";
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
