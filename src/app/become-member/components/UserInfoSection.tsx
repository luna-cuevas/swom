import {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import { FormValues } from "../types";
import { motion } from "framer-motion";

interface UserInfoSectionProps {
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  errors: any;
}

export const UserInfoSection = ({
  register,
  setValue,
  watch,
  errors,
}: UserInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-[#172544] mb-6">
        Tell us about yourself
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            {...register("userInfo.name", { required: "Name is required" })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
          {errors.userInfo?.name && (
            <p className="text-red-500 text-sm">
              {errors.userInfo.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            {...register("userInfo.email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
            placeholder="Enter your email"
          />
          {errors.userInfo?.email && (
            <p className="text-red-500 text-sm">
              {errors.userInfo.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <input
            type="tel"
            {...register("userInfo.phone", {
              required: "Phone number is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
            placeholder="Enter your phone number"
          />
          {errors.userInfo?.phone && (
            <p className="text-red-500 text-sm">
              {errors.userInfo.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            {...register("userInfo.dob", {
              required: "Date of birth is required",
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
          />
          {errors.userInfo?.dob && (
            <p className="text-red-500 text-sm">
              {errors.userInfo.dob.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Profession *
        </label>
        <input
          type="text"
          {...register("userInfo.profession", {
            required: "Profession is required",
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
          placeholder="Enter your profession"
        />
        {errors.userInfo?.profession && (
          <p className="text-red-500 text-sm">
            {errors.userInfo.profession.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          About Me *
        </label>
        <textarea
          {...register("userInfo.about_me", {
            required: "About me is required",
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all min-h-[100px]"
          placeholder="Tell us about yourself..."
        />
        {errors.userInfo?.about_me && (
          <p className="text-red-500 text-sm">
            {errors.userInfo.about_me.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Do you have children? *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="always"
              {...register("userInfo.children", {
                required: "Please select an option",
              })}
              className="w-4 h-4 text-[#E78426] focus:ring-[#E78426]"
            />
            <span>Always</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="sometimes"
              {...register("userInfo.children", {
                required: "Please select an option",
              })}
              className="w-4 h-4 text-[#E78426] focus:ring-[#E78426]"
            />
            <span>Sometimes</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="never"
              {...register("userInfo.children", {
                required: "Please select an option",
              })}
              className="w-4 h-4 text-[#E78426] focus:ring-[#E78426]"
            />
            <span>Never</span>
          </label>
        </div>
        {errors.userInfo?.children && (
          <p className="text-red-500 text-sm">
            {errors.userInfo.children.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          How did you hear about us? *
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="wikimujeres"
              {...register("userInfo.recommended", {
                required: "Please select an option",
              })}
              className="w-4 h-4 text-[#E78426] focus:ring-[#E78426]"
              onChange={(e) => {
                if (e.target.checked) {
                  setValue("userInfo.recommended", "wikimujeres");
                }
              }}
            />
            <span>Wikimujeres</span>
          </label>
          <div className="flex-1">
            <input
              type="text"
              {...register("userInfo.recommended", {
                required: {
                  value: true,
                  message: "Please select an option or enter a value",
                },
                validate: (value) => {
                  const isWikimujeres =
                    watch("userInfo.recommended") === "wikimujeres";
                  return (
                    isWikimujeres ||
                    value.length > 0 ||
                    "Please select an option or enter a value"
                  );
                },
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
              placeholder="Other (please specify)"
              disabled={watch("userInfo.recommended") === "wikimujeres"}
            />
          </div>
        </div>
        {errors.userInfo?.recommended && (
          <p className="text-red-500 text-sm">
            {errors.userInfo.recommended.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Which cities would you like to visit? (Optional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            {...register("userInfo.openToOtherCities.cityVisit1")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
            placeholder="City 1"
          />
          <input
            type="text"
            {...register("userInfo.openToOtherCities.cityVisit2")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
            placeholder="City 2"
          />
          <input
            type="text"
            {...register("userInfo.openToOtherCities.cityVisit3")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E78426] focus:border-transparent transition-all"
            placeholder="City 3"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register("userInfo.openToOtherDestinations")}
            className="mt-1 w-5 h-5 text-[#E78426] border-gray-300 rounded focus:ring-[#E78426]"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Are you open to other destinations?
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Check this if you&apos;re interested in exploring destinations
              beyond your specified cities
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
