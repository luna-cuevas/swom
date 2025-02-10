import { UseFormRegister } from "react-hook-form";
import { ListingFormData } from "../types";

interface Props {
  register: UseFormRegister<ListingFormData>;
}

export function UserInfoSection({ register }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Your Information</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <input
            {...register("user_info.name")}
            placeholder="Name"
            className="w-full p-3 border rounded-lg bg-gray-50"
          />
          <input
            {...register("user_info.profession")}
            placeholder="Profession"
            className="w-full p-3 border rounded-lg bg-gray-50"
          />
          <input
            {...register("user_info.phone")}
            placeholder="Phone"
            className="w-full p-3 border rounded-lg bg-gray-50"
          />
          <input
            {...register("user_info.age")}
            type="number"
            placeholder="Age"
            className="w-full p-3 border rounded-lg bg-gray-50"
          />
        </div>
        <textarea
          {...register("user_info.about_me")}
          placeholder="Tell us about yourself..."
          className="w-full p-3 border rounded-lg bg-gray-50 min-h-[150px]"
        />
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cities you would like to visit
            </label>
            <div className="space-y-3">
              <input
                {...register("user_info.open_to_other_cities.cityVisit1")}
                placeholder="First choice city"
                className="w-full p-3 border rounded-lg bg-gray-50"
              />
              <input
                {...register("user_info.open_to_other_cities.cityVisit2")}
                placeholder="Second choice city"
                className="w-full p-3 border rounded-lg bg-gray-50"
              />
              <input
                {...register("user_info.open_to_other_cities.cityVisit3")}
                placeholder="Third choice city"
                className="w-full p-3 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("user_info.open_to_other_destinations")}
              className="w-5 h-5 rounded border-gray-300 text-[#7F8119] focus:ring-[#7F8119]"
            />
            <label className="text-sm text-gray-700">
              Open to other destinations
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
