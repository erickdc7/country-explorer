
"use client";
import { useEffect, useState } from "react";
import { HeartOff } from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";
import CountryCard from "../components/CountryCard"; // 👈 usa tu card con nuevo estilo
import { Country } from "../types/country";
import { useFavorites } from "../stores/useFavorites";
import CountryDetailsDialog from "../components/CountryDetailsDialog";

export default function FavoritesPage() {
    const { favorites, remove, isFavorite } = useFavorites();
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const handleCardClick = (country: Country) => {
        setSelectedCountry(country);
        setDialogOpen(true);
    };

    if (!isHydrated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="text-center mb-8 space-y-4">
                        <Skeleton className="mx-auto h-10 w-72 rounded-full" />
                        <Skeleton className="mx-auto h-4 w-1/3 rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={index}
                                className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
                            >
                                <Skeleton className="h-40 rounded-3xl" />
                                <Skeleton className="h-5 w-2/3 rounded-full" />
                                <Skeleton className="h-4 w-1/2 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Encabezado */}
                <div className="text-center mb-8">
                    <h2 className="mb-2">Mis Favoritos</h2>
                    <p className="text-muted-foreground">
                        {favorites.length}{" "}
                        {favorites.length === 1 ? "país guardado" : "países guardados"}
                    </p>
                </div>

                {/* Grid de tarjetas */}
                {favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((country) => (
                            <CountryCard
                                key={country.cca3}
                                country={country}
                                onOpen={handleCardClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <HeartOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="mb-2 text-muted-foreground">
                            No tienes países favoritos
                        </h3>
                        <p className="text-muted-foreground">
                            Explora países y marca tus favoritos con el ícono de corazón
                        </p>
                    </div>
                )}
            </div>

            <CountryDetailsDialog
                country={selectedCountry}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}

