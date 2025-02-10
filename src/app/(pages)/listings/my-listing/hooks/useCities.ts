import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/utils/supabaseClient";
import { UseFormSetValue } from "react-hook-form";
import { ListingFormData } from "../types";

export function useCities(setValue: UseFormSetValue<ListingFormData>) {
  const [cities, setCities] = useState<any[]>([]);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .order("city");

      if (error) {
        console.error("Error fetching cities:", error);
        return;
      }

      setCities(data);
    };

    fetchCities();
  }, [supabase]);

  const filteredCities = cities.filter((city) => {
    return city.city
      .toLowerCase()
      .includes(searchTerm.split(",")[0].toLowerCase());
  });

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    setValue("home_info.city", value);
    if (value.length > 0) {
      setCitySearchOpen(true);
    }
  };

  const handleCitySelect = (city: any) => {
    setCitySearchOpen(false);
    const cityString = `${city.city}, ${city.country}`;
    setSearchTerm(cityString);
    setValue("home_info.city", cityString);
  };

  return {
    cities,
    citySearchOpen,
    searchTerm,
    setSearchTerm,
    filteredCities,
    handleInputChange,
    handleCitySelect,
  };
} 