"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Country } from "../types/country";
import CountryCard from "./CountryCard";
import Filters from "./Filters";
import CountryDetailsDialog from "./CountryDetailsDialog";

export default function CountriesPageClient() {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estado de los filtros activos
    const [search, setSearch] = useState("");
    const [region, setRegion] = useState("");
    const [minPop, setMinPop] = useState<number | undefined>(undefined);
    const [maxPop, setMaxPop] = useState<number | undefined>(undefined);
    const [sort, setSort] = useState("");

    // País seleccionado y visibilidad del dialog
    const [selected, setSelected] = useState<Country | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Obtiene todos los países de la API al montar el componente
    useEffect(() => {
        setLoading(true);
        fetch(
            "https://restcountries.com/v3.1/all?fields=name,cca3,flags,region,population,capital"
        )
            .then((res) => {
                if (!res.ok) throw new Error("Error al obtener países");
                return res.json();
            })
            .then((data: Country[]) => {
                setCountries(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // Extrae regiones únicas y ordenadas para el selector de filtro
    const regions = useMemo(() => {
        return Array.from(
            new Set(
                countries
                    .map((c) => c.region)
                    .filter((region): region is string => Boolean(region))
            )
        ).sort();
    }, [countries]);

    // Aplica filtros y ordenamiento sobre la lista de países
    const filtered = useMemo(() => {
        let list = [...countries];

        // Búsqueda por nombre (case-insensitive)
        if (search.trim()) {
            const s = search.trim().toLowerCase();
            list = list.filter((c) => c.name.common.toLowerCase().includes(s));
        }

        // Filtro por región
        if (region)
            list = list.filter(
                (c) => region === "all" || region === "" || c.region === region
            );

        // Filtro por rango de población
        if (typeof minPop === "number")
            list = list.filter((c) => (c.population ?? 0) >= minPop);
        if (typeof maxPop === "number")
            list = list.filter((c) => (c.population ?? 0) <= maxPop);

        // Ordenamiento por nombre o población
        if (sort) {
            if (sort === "name-asc")
                list.sort((a, b) => a.name.common.localeCompare(b.name.common));
            if (sort === "name-desc")
                list.sort((a, b) => b.name.common.localeCompare(a.name.common));
            if (sort === "pop-asc")
                list.sort((a, b) => (a.population ?? 0) - (b.population ?? 0));
            if (sort === "pop-desc")
                list.sort((a, b) => (b.population ?? 0) - (a.population ?? 0));
        }

        return list;
    }, [countries, search, region, minPop, maxPop, sort]);

    if (loading) return <div className="p-6">Cargando países…</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <Filters
                search={search}
                setSearch={setSearch}
                region={region}
                setRegion={setRegion}
                minPop={minPop}
                setMinPop={setMinPop}
                maxPop={maxPop}
                setMaxPop={setMaxPop}
                sort={sort}
                setSort={setSort}
                regions={regions}
                resultCount={filtered.length}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((c) => (
                    // Al abrir una card, se guarda el país y se abre el dialog
                    <CountryCard
                        key={c.cca3}
                        country={c}
                        onOpen={(ct) => {
                            setSelected(ct);
                            setDialogOpen(true);
                        }}
                    />
                ))}
            </div>

            {/* Dialog con el detalle del país seleccionado */}
            <CountryDetailsDialog
                country={selected}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
