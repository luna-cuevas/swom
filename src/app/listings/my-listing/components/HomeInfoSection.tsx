import { UseFormRegister } from "react-hook-form";
import { ListingFormData } from "../types";

interface Props {
  register: UseFormRegister<ListingFormData>;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  citySearchOpen: boolean;
  filteredCities: any[];
  onCitySelect: (city: any) => void;
  status: string;
}

export function HomeInfoSection({
  register,
  searchTerm,
  onSearchTermChange,
  citySearchOpen,
  filteredCities,
  onCitySelect,
  status,
}: Props) {
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
