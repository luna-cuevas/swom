import { UseFormRegister } from "react-hook-form";
import { FormValues } from "../types";
import { Dispatch, SetStateAction } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from "framer-motion";

interface PrivacyPolicySectionProps {
  register: UseFormRegister<FormValues>;
  errors: any;
  setCaptchaToken: Dispatch<SetStateAction<string | null>>;
}

export const PrivacyPolicySection = ({
  register,
  errors,
  setCaptchaToken,
}: PrivacyPolicySectionProps) => {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-[#172544] mb-6">
        Final Steps
      </motion.h2>

      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register("privacyPolicy", {
              required: "You must accept the privacy policy",
            })}
            className="mt-1 w-5 h-5 text-[#E78426] border-gray-300 rounded focus:ring-[#E78426]"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Privacy Policy Agreement *
            </label>
            <p className="text-sm text-gray-500 mt-1 flex gap-1">
              I agree to the{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-[#E78426] hover:text-[#e78326d8] underline">
                privacy policy
              </a>{" "}
              and consent to the processing of my personal data.
            </p>
            {errors.privacyPolicy && (
              <p className="text-red-500 text-sm mt-1">
                {errors.privacyPolicy.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY || ""}
            onChange={(value) => setCaptchaToken(value)}
          />
        </div>
      </div>
    </div>
  );
};
