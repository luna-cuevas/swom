import Image from "next/image";
import Link from "next/link";

type Props = {
  scrollToForm: () => void;
};

export const HeroSection = ({ scrollToForm }: Props) => {
  return (
    <div className="w-full bg-[#F3EBE7] border-b border-gray-200">
      <div className="flex flex-col md:flex-row max-w-screen-xl mx-auto relative">
        {/* Mobile Image */}
        <div className="md:hidden relative h-[300px] w-full mb-8">
          <Image
            objectFit="cover"
            fill
            src="/membership/become-member-bg.png"
            className="rounded-b-[2rem]"
            alt="Scenic view of a beachfront property"
            priority
          />
        </div>

        {/* Desktop Image */}
        <div className="hidden md:block md:w-[45%] relative h-[500px] py-12">
          <Image
            objectFit="cover"
            fill
            src="/membership/become-member-bg.png"
            className="rounded-[2rem] shadow-lg"
            alt="Scenic view of a beachfront property"
            priority
          />
        </div>

        <div className="md:w-[55%] md:pl-16 flex flex-col justify-center px-6 md:px-8 pb-12 md:py-12 h-fit">
          <div className="max-w-2xl">
            <div className="w-24 md:w-32 h-[1px] bg-gray-400 mb-6 md:mb-8" />
            <h1 className="text-3xl md:text-6xl mb-4 md:mb-6 font-['EBGaramond'] tracking-tight text-gray-900">
              How to become{" "}
              <span className="italic text-[#E78426]">a member</span>
            </h1>
            <p className="text-base md:text-xl text-gray-800 mb-6 md:mb-8 leading-relaxed font-['Noto']">
              Fill out the questionnaire below. That is all. This will help us
              to get to know you better. In it, you will be asked questions
              about your property that are easy to answer. It will take you 6
              minutes to complete.
            </p>
            <p className="text-sm md:text-base text-gray-600 font-['Noto']">
              SWOM&apos;s selection process is rigorous and highly selective.
              All applicants must pass a screening process that verifies their
              trustworthiness, reveals their familiarity with family and
              friends, and assesses how well they fit into the design values of
              the community.{" "}
              <Link
                className="text-[#E78426] hover:underline font-medium inline-flex items-center gap-1"
                href="/terms-conditions">
                Read our terms and conditions
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
