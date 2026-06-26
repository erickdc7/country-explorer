
"use client";
import { Heart, Users } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Country } from "../types/country";
import { useFavorites } from "../stores/useFavorites";

type Props = {
  country: Country;
  onOpen: (c: Country) => void;
};

export default function CountryCard({ country, onOpen }: Props) {
  const toggle = useFavorites((s) => s.toggle);
  const isFav = useFavorites((s) => s.isFavorite(country.cca3));
  const flag = country.flags?.png || country.flags?.svg;

  const formatPopulation = (num: number) =>
    new Intl.NumberFormat("es-ES").format(num);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(country);
  };

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      onClick={() => onOpen(country)}
    >
      <CardContent className="p-6">
        {/* Header con bandera y nombre */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Bandera */}
            <div className="w-16 h-12 rounded-md overflow-hidden shadow-sm flex-shrink-0 border">
              {flag ? (
                <img
                  src={flag}
                  alt={country.flags?.alt || `Bandera de ${country.name.common}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted/20 flex items-center justify-center text-[10px] text-muted-foreground">
                  Sin bandera
                </div>
              )}
            </div>
            <div>
              <h3 className="mb-1 font-semibold">{country.name.common}</h3>
              <Badge variant="secondary" className="text-xs">
                {country.region ?? "-"}
              </Badge>
            </div>
          </div>

          {/* Botón de favorito */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoriteClick}
            className="hover:scale-110 transition-transform"
          >
            <Heart
              className={`h-5 w-5 ${isFav ? "fill-red-500 text-red-500" : "text-muted-foreground"
                }`}
            />
          </Button>
        </div>

        {/* Población */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span className="text-sm">
            {country.population
              ? `${formatPopulation(country.population)} habitantes`
              : "-"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
