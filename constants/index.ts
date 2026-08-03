const rawApiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawApiUrl) {
    throw new Error(
        "NEXT_PUBLIC_API_URL is not set. Set it in Netlify > Project configuration > Environment variables, or in .env.local for local development."
    );
}

export const API_URL = rawApiUrl.replace(/\/+$/, "");
