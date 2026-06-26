"use client";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";

type Props = {
    search: string;
    setSearch: (s: string) => void;
    region: string;
    setRegion: (r: string) => void;
    minPop: number | undefined;
    setMinPop: (n?: number) => void;
    maxPop: number | undefined;
    setMaxPop: (n?: number) => void;
    sort: string;
    setSort: (s: string) => void;
    regions: string[];
    resultCount?: number;
    isSearching?: boolean;
};

export default function Filters({
    search,
    setSearch,
    region,
    setRegion,
    minPop,
    setMinPop,
    maxPop,
    setMaxPop,
    sort,
    setSort,
    regions,
    resultCount,
    isSearching = false,
}: Props) {
    return (
        <div className="space-y-6 bg-dark rounded-lg p-6">
            {/* Encabezado */}
            <div className="text-center mb-8">
                <h2 className="mb-2">Buscar países</h2>
                <p className="text-muted-foreground">
                    Explora información de países de todo el mundo
                </p>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Buscar por nombre de país..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12"
                />
            </div>

            {/* Selectores principales */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                {/* Región */}
                <div className="flex-1">
                    <Label className="mb-2 block">Región</Label>
                    <Select value={region} onValueChange={setRegion}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {regions.map((r) => (
                                <SelectItem key={r} value={r}>
                                    {r}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Ordenar */}
                <div className="flex-1">
                    <Label className="mb-2 block">Ordenar</Label>
                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sin ordenar" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Sin ordenar</SelectItem>
                            <SelectItem value="name-asc">Nombre ↑</SelectItem>
                            <SelectItem value="name-desc">Nombre ↓</SelectItem>
                            <SelectItem value="pop-desc">Población ↑</SelectItem>
                            <SelectItem value="pop-asc">Población ↓</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Población */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="flex-1">
                    <Label htmlFor="min-population" className="mb-2 block">
                        Población mínima
                    </Label>
                    <Input
                        id="min-population"
                        type="number"
                        placeholder="Ej: 1000000"
                        value={minPop ?? ""}
                        onChange={(e) =>
                            setMinPop(e.target.value ? Number(e.target.value) : undefined)
                        }
                        min={0}
                    />
                </div>

                <div className="flex-1">
                    <Label htmlFor="max-population" className="mb-2 block">
                        Población máxima
                    </Label>
                    <Input
                        id="max-population"
                        type="number"
                        placeholder="Ej: 100000000"
                        value={maxPop ?? ""}
                        onChange={(e) =>
                            setMaxPop(e.target.value ? Number(e.target.value) : undefined)
                        }
                        min={0}
                    />
                </div>

            </div>

            {/* Resultados */}
            {resultCount !== undefined && (
                <div className="text-center text-sm text-muted-foreground pt-4">
                    {isSearching
                        ? "Buscando países..."
                        : `Mostrando ${resultCount} ${resultCount === 1 ? 'país' : 'países'}`}
                </div>
            )}
        </div>
    );
}
