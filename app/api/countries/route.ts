import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { Country } from "@/app/types/country";

interface RestCountryRecord {
  codes?: {
    alpha_3?: string;
  };
  cca3?: string;
  names?: {
    common?: string;
    official?: string;
  };
  flag?: {
    url_png?: string;
    url_svg?: string;
    description?: string;
  };
  region?: string;
  population?: number;
  capitals?: Array<{ name?: string } | string>;
}

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

function normalizeCountry(raw: RestCountryRecord): Country {
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

function filterCountriesBySearch(countries: Country[], search: string) {
  const query = search.toLowerCase();

  return countries.filter((country) => {
    const name = country.name.common.toLowerCase();
    const official = country.name.official?.toLowerCase() ?? "";
    const capital = (country.capital ?? []).join(" ").toLowerCase();
    const region = country.region?.toLowerCase() ?? "";

    return [name, official, capital, region].some((value) => value.includes(query));
  });
}

async function fetchCountries(search?: string) {
  const url = new URL(API_BASE);
  url.searchParams.set("response_fields", RESPONSE_FIELDS);
  url.searchParams.set("limit", search ? "100" : "100");

  if (search) {
    url.searchParams.set("q", search);
  }

  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing REST_COUNTRIES_API_KEY environment variable." },
      { status: 500 }
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const response = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!response.ok && search) {
    const fallbackUrl = new URL(API_BASE);
    fallbackUrl.searchParams.set("response_fields", RESPONSE_FIELDS);
    fallbackUrl.searchParams.set("limit", "100");

    const fallbackResponse = await fetch(fallbackUrl.toString(), {
      headers,
      cache: "no-store",
    });

    if (!fallbackResponse.ok) {
      return [];
    }

    const fallbackJson = await fallbackResponse.json();
    const objects = fallbackJson?.data?.objects;

    if (!Array.isArray(objects)) {
      return [];
    }

    return filterCountriesBySearch(
      objects.map((raw: RestCountryRecord) => normalizeCountry(raw)),
      search
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.errors?.[0]?.message || "Error fetching countries from REST Countries API.";
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const json = await response.json();

  if (!search) {
    return json;
  }

  const objects = json?.data?.objects;
  if (!Array.isArray(objects)) {
    return [];
  }

  return filterCountriesBySearch(
    objects.map((raw: RestCountryRecord) => normalizeCountry(raw)),
    search
  );
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search")?.trim() || undefined;
  const result = await fetchCountries(search);

  if (result instanceof NextResponse) {
    return result;
  }

  if (Array.isArray(result)) {
    return NextResponse.json(result);
  }

  const objects = result?.data?.objects;

  if (!Array.isArray(objects)) {
    return NextResponse.json(
      { error: "Invalid response shape from REST Countries API." },
      { status: 502 }
    );
  }

  const countries = objects.map((raw: RestCountryRecord) => normalizeCountry(raw));

  return NextResponse.json(countries);
}
