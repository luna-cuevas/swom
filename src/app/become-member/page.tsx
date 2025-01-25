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
    signUpActive,
    setSignUpActive,
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
    setSignUpActive(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
    <main className="min-h-screen flex flex-col bg-[#F3EBE7]">
      <HeroSection scrollToForm={scrollToForm} />

      {submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col my-16 justify-center items-center bg-white rounded-xl p-12 shadow-md max-w-2xl mx-auto">
          <h1 className="text-4xl font-semibold text-[#172544] mb-4">
            Thank you for your submission!
          </h1>
          <p className="text-lg text-gray-600">
            Someone will be in touch with you shortly.
          </p>
        </motion.div>
      ) : (
        signUpActive && (
          <div ref={formRef} className="w-full py-16 px-4">
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="max-w-[1000px] mx-auto">
              <div className="bg-white rounded-xl p-8 shadow-md">
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-8">
                  <motion.div
                    className="h-full bg-[#E78426] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

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

                <div className="flex justify-between mt-8">
                  {!isFirstStep && (
                    <button
                      type="button"
                      onClick={goToPreviousStep}
                      disabled={isSubmitting}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      Back
                    </button>
                  )}
                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        goToNextStep();
                      }}
                      className="ml-auto bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105">
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="ml-auto bg-[#E78426] hover:bg-[#e78326d8] text-white font-bold px-8 py-3 rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )
      )}
    </main>
  );
}
