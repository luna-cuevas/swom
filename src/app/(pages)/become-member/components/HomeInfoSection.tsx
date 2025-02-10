import { UseFormRegister } from "react-hook-form";
import { FormValues } from "../types";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";

interface HomeInfoSectionProps {
  register: UseFormRegister<FormValues>;
  errors: any;
  setWhereIsIt: Dispatch<
    SetStateAction<{
      lat: number;
      lng: number;
      query: string;
    }>
  >;
}

export const HomeInfoSection = ({
  register,
  errors,
  setWhereIsIt,
}: HomeInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-[#172544] mb-6">
        Tell us about your home
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Type *
          </label>
          <select
            {...register("homeInfo.property", {
              required: "Property type is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all">
            <option value="">Select property type</option>
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Farm">Farm</option>
            <option value="Boat">Boat</option>
            <option value="RV">RV</option>
            <option value="Other">Other</option>
          </select>
          {errors.homeInfo?.property && (
            <p className="text-red-500 text-sm">
              {errors.homeInfo.property.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Property Location *
          </label>
          <select
            {...register("homeInfo.locatedIn", {
              required: "Location type is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all">
            <option value="">Select location type</option>
            <option value="a condominium">A condominium</option>
            <option value="a gated community">A gated community</option>
            <option value="it rests freely">It rests freely</option>
            <option value="other">Other</option>
          </select>
          {errors.homeInfo?.locatedIn && (
            <p className="text-red-500 text-sm">
              {errors.homeInfo.locatedIn.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            How many people does it sleep? *
          </label>
          <select
            {...register("homeInfo.howManySleep", {
              required: "Capacity is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all">
            <option value="">Select capacity</option>
            {["1", "2", "3", "4", "5", "6", "7+"].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          {errors.homeInfo?.howManySleep && (
            <p className="text-red-500 text-sm">
              {errors.homeInfo.howManySleep.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Number of Bathrooms *
          </label>
          <select
            {...register("homeInfo.bathrooms", {
              required: "Number of bathrooms is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all">
            <option value="">Select number of bathrooms</option>
            {["1", "2", "3", "4+"].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          {errors.homeInfo?.bathrooms && (
            <p className="text-red-500 text-sm">
              {errors.homeInfo.bathrooms.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Is this your main property or second home? *
        </label>
        <select
          {...register("homeInfo.mainOrSecond", {
            required: "Please select an option",
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all">
          <option value="">Select option</option>
          <option value="main">Main Home</option>
          <option value="second">Second Home</option>
        </select>
        {errors.homeInfo?.mainOrSecond && (
          <p className="text-red-500 text-sm">
            {errors.homeInfo.mainOrSecond.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Size in square meters *
        </label>
        <select
          {...register("homeInfo.area", { required: "Size is required" })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all">
          <option value="">Select size range</option>
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
            "500-550",
            "550-600",
          ].map((range) => (
            <option key={range} value={range}>
              {range} m²
            </option>
          ))}
        </select>
        {errors.homeInfo?.area && (
          <p className="text-red-500 text-sm">{errors.homeInfo.area.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          {...register("homeInfo.title", { required: "Title is required" })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
          placeholder="Name of the house, street, or anything distinctive"
        />
        {errors.homeInfo?.title && (
          <p className="text-red-500 text-sm">
            {errors.homeInfo.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          {...register("homeInfo.description", {
            required: "Description is required",
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all min-h-[100px]"
          placeholder="Write a description of your property..."
        />
        {errors.homeInfo?.description && (
          <p className="text-red-500 text-sm">
            {errors.homeInfo.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Location *
        </label>
        <GoogleMapComponent hideMap={true} setWhereIsIt={setWhereIsIt} />
      </div>
    </div>
  );
};
