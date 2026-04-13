import type { MiddlewareHandler } from "astro";

/** 4 hours (14400s). Browsers revalidate often; shared caches (incl. Cloudflare CDN) hold the page. */
const CACHE_CONTROL =
    "public, max-age=0, s-maxage=14400, stale-while-revalidate=3600";
/** Cloudflare edge TTL — see https://developers.cloudflare.com/cache/concepts/cache-control */
const CDN_CACHE_CONTROL = "public, max-age=14400, stale-while-revalidate=3600";

function shouldCacheHomeOrNewsIsland(pathname: string): boolean {
    return (
        pathname === "/" ||
        pathname === "" ||
        pathname.startsWith("/_server-islands/")
    );
}

export const onRequest: MiddlewareHandler = async (context, next) => {
    const response = await next();
    const pathname = context.url.pathname;
    if (!shouldCacheHomeOrNewsIsland(pathname)) {
        return response;
    }

    const headers = new Headers(response.headers);
    headers.set("Cache-Control", CACHE_CONTROL);
    headers.set("CDN-Cache-Control", CDN_CACHE_CONTROL);
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
};
