import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { ListingFormData } from "../types";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import React from "react";

const libraries: ("places" | "geometry")[] = ["places"];

interface Props {
  register: UseFormRegister<ListingFormData>;
  setValue: UseFormSetValue<ListingFormData>;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  citySearchOpen: boolean;
  filteredCities: any[];
  onCitySelect: (city: any) => void;
  status: string;
}

export function HomeInfoSection({
  register,
  setValue,
  searchTerm,
  onSearchTermChange,
  citySearchOpen,
  filteredCities,
  onCitySelect,
  status,
}: Props) {
  const [autocomplete, setAutocomplete] = React.useState<any>(null);
  const [addressString, setAddressString] = React.useState<string>("");
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  const onPlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place || !place.geometry) return;

    setValue("home_info.address", {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      query: place.formatted_address,
    });

    setAddressString(place.formatted_address);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">About Your Home</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className={`w-2 h-2 rounded-full ${status === "archived" ? "bg-red-500" : "bg-green-500"}`}></span>
          {status === "archived" ? "Archived" : "Active"}
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <input
              {...register("home_info.title")}
              placeholder="Title"
              className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              {...register("home_info.property_type")}
              className="w-full p-3 border rounded-lg bg-gray-50">
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Farm">Farm</option>
              <option value="Boat">Boat</option>
              <option value="RV">RV</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Located In
            </label>
            <select
              {...register("home_info.located_in")}
              className="w-full p-3 border rounded-lg bg-gray-50">
              <option value="a condominium">A condominium</option>
              <option value="a gated community">A gated community</option>
              <option value="it rests freely">It rests freely</option>
              <option value="other">A rural area</option>
            </select>
          </div>
        </div>

        {/* Address Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <div className="relative">
            <LoadScript
              googleMapsApiKey={
                process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
              }
              libraries={libraries}
              onLoad={() => setScriptLoaded(true)}>
              {scriptLoaded && (
                <Autocomplete
                  onLoad={setAutocomplete}
                  onPlaceChanged={onPlaceChanged}>
                  <input
                    className="w-full p-3 border rounded-lg bg-gray-50 pl-10 focus:bg-white transition-colors"
                    placeholder="Search for an address"
                    value={addressString}
                    onChange={(e) => setAddressString(e.target.value)}
                  />
                </Autocomplete>
              )}
            </LoadScript>
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <select
              {...register("home_info.how_many_sleep")}
              className="w-full p-3 border rounded-lg bg-gray-50">
              {[1, 2, 3, 4, 5, 6, 7, "+8"].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bathrooms
            </label>
            <select
              {...register("home_info.bathrooms")}
              className="w-full p-3 border rounded-lg bg-gray-50">
              {[1, 2, 3, 4, 5, "6+"].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Area
            </label>
            <select
              {...register("home_info.area")}
              className="w-full p-3 border rounded-lg bg-gray-50">
              {[
                "60-100",
                "100-150",
                "150-200",
                "200-250",
                "250-300",
                "300-350",
                "350-400",
                "400-450",
                "450-500",
                "500+",
              ].map((range) => (
                <option key={range} value={range}>
                  {range} m²
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Search for a city"
              className="w-full p-3 border rounded-lg bg-gray-50"
            />
            {citySearchOpen && filteredCities.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-auto shadow-lg">
                {filteredCities.map((city: any) => (
                  <li
                    key={city._id}
                    onClick={() => onCitySelect(city)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0">
                    {city.city}, {city.country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("home_info.description")}
            placeholder="Describe your property..."
            className="w-full p-3 border rounded-lg bg-gray-50 min-h-[150px]"
          />
        </div>
      </div>
    </div>
  );
}
