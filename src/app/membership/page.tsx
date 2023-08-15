import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  return (
    <main className="flex relative min-h-screen h-[120vh] sm:h-[100vh] md:h-fit overflow-hidden bg-[#17212D]">
      <div className="relative h-[60vh] w-full">
        <Image
          src="/membership/membership.webp"
          alt="hero"
          fill
          objectFit="cover"
        />
      </div>
      <div className="md:w-2/3 max-w-[1000px] w-11/12 z-20 m-auto top-6 md:top-0 md:bottom-0 md:pl-8 p-2 md:px-0  py-4 left-0 right-0 rounded-2xl h-fit min-h-[70vh] absolute bg-[#F4ECE8]">
        <div className="w-full text-center md:text-left h-fit pb-2 mb-4 border-b-2 border-gray-400">
          <div className="relative w-[250px] h-[80px]">
            <Image src="/swom-logo.jpg" alt="logo" fill objectFit="contain" />
          </div>
          <h1 className="text-2xl font-sans font-bold uppercase tracking-[0.3rem] py-2">
            Memberships
          </h1>
        </div>

        <div>
          <h3 className="text-lg text-center md:text-left text-[#4F6876] uppercase tracking-[0.3rem] mb-8">
            Your Membership
          </h3>
          <div className="flex flex-col md:flex-row gap-4 md:gap-12">
            <div className="p-4 border-[1px] rounded-3xl border-[#6D7283]">
              <h3 className="text-sm uppercase mb-2 tracking-[0.3rem]">
                MEMBERSHIP TYPE
              </h3>
              <p className="text-base ">One year membership</p>
            </div>
            <div className="p-4 border-[1px] rounded-3xl border-[#6D7283]">
              <h3 className="text-sm text-[#E88527] uppercase mb-2 tracking-[0.3rem]">
                Next payment
              </h3>
              <p className="text-base">June 26, 2023</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg text-center md:text-left mt-8 text-[#4F6876] uppercase tracking-[0.3rem] mb-4">
            Includes
          </h3>
          <ul className="list-disc pl-4 ">
            <li className="font-light">
              Access to all swom travel listings immediately.
            </li>
            <li className="font-light">
              Being able to contact other members via internal chat at all
              times.
            </li>
            <li className="font-light">
              By clicking on the pay button you agree to automatically change
              the annual or bi-annual subscription.
            </li>
          </ul>
        </div>

        <div className="flex gap-2 flex-wrap justify-center md:justify-start md:gap-8 my-6">
          <button className="md:p-4 p-3 hover:bg-[#ff9f45] rounded-xl text-xs uppercase tracking-[0.3rem] bg-[#E88527] font-bold text-white">
            Cancel Membership
          </button>
          <button className="md:p-4 p-3 hover:bg-[#c7bfbe] rounded-xl text-xs uppercase tracking-[0.3rem] bg-[#DDD5D2] font-bold">
            Recommend Us
          </button>
        </div>

        <div className="md:w-11/12 ml-auto bg-[#DDD5D2] px-6 p-4 rounded-3xl md:rounded-l-3xl mt-4">
          <h3 className="uppercase font-thin tracking-[0.3rem]">Contact Us!</h3>
          <p className="text-sm flex flex-wrap gap-[3px] font-sans">
            For questions contact us via Whatsapp or email us at{' '}
            <span>
              <Link
                className="text-blue-500"
                href="mailto:info@swom.travel"
                target="_blank"
                rel="noopener noreferrer">
                info@swom.travel
              </Link>
            </span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 w-fit m-auto left-0 right-0">
        <div className="relative w-12 h-12 mx-auto">
          <Image
            src="/membership/swom-blue.png"
            alt="logo"
            fill
            objectFit="cover"
          />
        </div>
        <h2 className="text-2xl text-center tracking-widest uppercase text-white">
          Traveling to a whole new level
        </h2>
      </div>
    </main>
  );
};

export default Page;
