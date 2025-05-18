// lavie/src/lib/sessionUtils.ts
import UAParser from "ua-parser-js";

export async function extractSessionInfo(req: Request) {
  // Device info
  const ua = req.headers.get("user-agent") || "";
  const parser = new UAParser(ua);
  const device = [
    parser.getBrowser().name,
    parser.getOS().name,
    parser.getDevice().model,
  ].filter(Boolean).join(" on ");

  // IP address
  let ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    (req as any).ip ||
    undefined;

  // Location (use a free API, e.g., ip-api.com)
  let location = undefined;
  if (ip && ip !== "127.0.0.1" && ip !== "::1") {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
      const geo = await geoRes.json();
      if (geo && geo.status === "success") {
        location = [geo.city, geo.regionName, geo.country].filter(Boolean).join(", ");
      }
    } catch {}
  }

  return { device, ip, location };
}