import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Country } from "../types/country";

// Estado y acciones del store de favoritos
interface FavState {
  favorites: Country[];
  add: (c: Country) => void;
  remove: (cca3: string) => void;
  toggle: (c: Country) => void;       // Agrega si no existe, elimina si ya está
  isFavorite: (cca3: string) => boolean;
}

// Store persistido en localStorage bajo la clave "favorites-storage"
export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      favorites: [],

      // Evita duplicados filtrando por cca3 antes de agregar
      add: (c) =>
        set((s) => ({
          favorites: [
            ...s.favorites.filter((f) => f.cca3 !== c.cca3),
            c,
          ],
        })),

      remove: (cca3) =>
        set((s) => ({
          favorites: s.favorites.filter((f) => f.cca3 !== cca3),
        })),

      toggle: (c) => {
        const exists = get().favorites.find((f) => f.cca3 === c.cca3);
        if (exists) get().remove(c.cca3);
        else get().add(c);
      },

      isFavorite: (cca3) =>
        Boolean(get().favorites.find((f) => f.cca3 === cca3)),
    }),
    { name: "favorites-storage" }
  )
);