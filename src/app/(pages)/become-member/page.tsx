"use client";
import { useRef } from "react";
import "react-toastify/dist/ReactToastify.css";
import { HeroSection } from "./components/HeroSection";
import { UserInfoSection } from "./components/UserInfoSection";
import { HomeInfoSection } from "./components/HomeInfoSection";
import { AmenitiesSection } from "./components/AmenitiesSection";
import { ImageUploadSection } from "./components/ImageUploadSection";
import { PrivacyPolicySection } from "./components/PrivacyPolicySection";
import { useBecomeMember } from "./hooks/useBecomeMember";
import { useFormSteps } from "./hooks/useFormSteps";
import { motion, AnimatePresence } from "framer-motion";

export default function Page() {
  const formRef = useRef<HTMLDivElement>(null);
  const {
    submitted,
    isSubmitting,
    imageFiles,
    setImageFiles,
    captchaToken,
    setCaptchaToken,
    whereIsIt,
    setWhereIsIt,
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    onSubmit,
    onError,
  } = useBecomeMember();

  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    getProgress,
    isFirstStep,
    isLastStep,
  } = useFormSteps();

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "user":
        return (
          <UserInfoSection
            register={register}
            setValue={setValue}
            watch={watch}
            errors={errors}
          />
        );
      case "home":
        return (
          <HomeInfoSection
            register={register}
            errors={errors}
            setWhereIsIt={setWhereIsIt}
          />
        );
      case "images":
        return (
          <ImageUploadSection
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
          />
        );
      case "amenities":
        return <AmenitiesSection register={register} />;
      case "submit":
        return (
          <PrivacyPolicySection
            register={register}
            errors={errors}
            setCaptchaToken={setCaptchaToken}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#F3EBE7]">
      <HeroSection scrollToForm={scrollToForm} />

      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col my-8 justify-center items-center bg-white rounded-xl p-8 md:p-12 shadow-md">
            <h1 className="text-3xl md:text-4xl font-semibold text-[#172544] mb-4 text-center">
              Thank you for your submission!
            </h1>
            <p className="text-base md:text-lg text-gray-600 text-center">
              Someone will be in touch with you shortly.
            </p>
          </motion.div>
        ) : (
          <div ref={formRef} className="py-6 md:py-8">
            <form onSubmit={handleSubmit(onSubmit, onError)}>
              <div className="bg-white rounded-xl p-6 md:p-12 shadow-md">
                {/* Progress Steps */}
                <div className="mb-8 md:mb-12">
                  {/* Mobile Progress */}
                  <div className="flex md:hidden items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#E78426] text-white flex items-center justify-center font-semibold">
                        {[
                          "user",
                          "home",
                          "images",
                          "amenities",
                          "submit",
                        ].indexOf(currentStep) + 1}
                      </div>
                      <span className="text-sm font-medium">
                        {
                          [
                            "Personal Info",
                            "Home Details",
                            "Photos",
                            "Amenities",
                            "Review",
                          ][
                            [
                              "user",
                              "home",
                              "images",
                              "amenities",
                              "submit",
                            ].indexOf(currentStep)
                          ]
                        }
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      Step{" "}
                      {[
                        "user",
                        "home",
                        "images",
                        "amenities",
                        "submit",
                      ].indexOf(currentStep) + 1}{" "}
                      of 5
                    </span>
                  </div>

                  {/* Desktop Progress */}
                  <div className="hidden md:flex justify-between mb-4">
                    {[
                      "Personal Info",
                      "Home Details",
                      "Photos",
                      "Amenities",
                      "Review",
                    ].map((step, index) => (
                      <div
                        key={step}
                        className="flex flex-col items-center flex-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                            ${
                              index ===
                              [
                                "user",
                                "home",
                                "images",
                                "amenities",
                                "submit",
                              ].indexOf(currentStep)
                                ? "bg-[#E78426] text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                          {index + 1}
                        </div>
                        <span className="text-sm text-center">{step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-full h-2 bg-gray-100 rounded-full">
                    <motion.div
                      className="h-full bg-[#E78426] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgress()}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Form Content */}
                <div className="min-h-[400px]">
                  <AnimatePresence>
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}>
                      {renderCurrentStep()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col-reverse md:flex-row justify-between gap-4 md:gap-0 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-100">
                  {!isFirstStep ? (
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Back
                    </button>
                  ) : (
                    <div className="hidden md:block" />
                  )}

                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        goToNextStep();
                      }}
                      className="flex items-center justify-center gap-2 bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 w-full md:w-auto">
                      Continue
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full md:w-auto">
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
