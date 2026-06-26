import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Country } from "@/app/types/country";

const API_BASE = "https://api.restcountries.com/countries/v5";
const RESPONSE_FIELDS = [
  "names.common",
  "names.official",
  "codes.alpha_3",
  "flag.url_png",
  "flag.url_svg",
  "flag.description",
  "region",
  "population",
  "capitals",
].join(",");

function normalizeCountry(raw: Record<string, any>): Country {
  const capitalData = raw.capitals;
  const capital = Array.isArray(capitalData)
    ? capitalData
        .map((item) => typeof item === "object" && item !== null ? item.name : undefined)
        .filter((value): value is string => typeof value === "string")
    : [];

  return {
    cca3: raw.codes?.alpha_3 ?? raw.cca3 ?? "",
    name: {
      common: raw.names?.common ?? "",
      official: raw.names?.official ?? undefined,
    },
    flags: {
      png: raw.flag?.url_png ?? undefined,
      svg: raw.flag?.url_svg ?? undefined,
      alt: raw.flag?.description ?? undefined,
    },
    region: raw.region ?? undefined,
    population: typeof raw.population === "number" ? raw.population : undefined,
    capital,
  };
}

async function fetchCountries(search?: string) {
  const url = new URL(API_BASE);
  url.searchParams.set("response_fields", RESPONSE_FIELDS);

  if (search) {
    url.searchParams.set("q", search);
    url.searchParams.set("limit", "100");
  } else {
    url.searchParams.set("limit", "20");
  }

  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing REST_COUNTRIES_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.errors?.[0]?.message || "Error fetching countries from REST Countries API.";
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const json = await response.json();
  return json;
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() || undefined;
  const result = await fetchCountries(search);

  if (result instanceof NextResponse) {
    return result;
  }

  const objects = result?.data?.objects;

  if (!Array.isArray(objects)) {
    return NextResponse.json(
      { error: "Invalid response shape from REST Countries API." },
      { status: 502 }
    );
  }

  const countries = objects.map((raw: Record<string, any>) => normalizeCountry(raw));

  return NextResponse.json(countries);
}
