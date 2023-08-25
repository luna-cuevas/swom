import Image from 'next/image';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  return (
    <main className="bg-[#F7F1EE]">
      <div className="flex py-8 bg-[#7F8119] justify-center gap-8 align-middle">
        <div className="h-[2px] my-auto w-1/4 border-[1px] border-white" />
        <h1 className="uppercase font-sans text-white text-2xl">About Us</h1>
        <div className="h-[2px] my-auto w-1/4 border-[1px] border-white" />
      </div>

      <div className="flex h-[50vh] md:w-2/3 m-auto py-4">
        <div className="md:w-1/3 px-4 m-auto">
          <h2 className="uppercase tracking-[0.3rem] font-light font-sans pb-4 text-xl">
            "I've got a life to <br /> start living."{' '}
          </h2>
          <p className="text-right uppercase tracking-[0.3rem] font-light font-sans pb-4 text-xs">
            - The Holiday (2006)
          </p>
        </div>
        <div className="relative w-1/2">
          <Image
            fill
            objectFit="cover"
            src="/about-us/about-1.png"
            alt="hero"
          />
        </div>
      </div>

      <div className="flex h-[50vh] justify-end  m-auto py-4">
        <div className="relative w-1/2 lg:w-1/3 -rotate-[12deg] h-auto 2xl:-mr-32 -mr-12">
          <Image
            fill
            objectFit="contain"
            src="/about-us/about-2.png"
            alt="hero"
          />
        </div>

        <div className="w-[60%] border-2 flex flex-col align-middle border-[#EB8828] p-8">
          <div className="my-auto ml-8 max-w-[600px]  flex flex-col gap-5 text-center">
            <p className="font-sans">
              Traveling has always been our lifestyle. Swapping homes has become
              our way to do so. We wanted to create a community of trust.
              Travelers who are kindred spirits.
            </p>
            <p className="font-sans">
              Paula is a design lover and Ana is tech oriented. We combined both
              worlds into SWOM.
            </p>
            <p className="font-sans uppercase tracking-[0.3rem]">
              ABOVE ALL, WE ARE FRIENDS.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col py-24 md:w-1/2 w-[80%] justify-center align-middle m-auto text-center min-h-[30vh]">
        <h2 className="uppercase text-2xl font- mb-10 font-sans tracking-[0.3rem]">
          WHY WE CREATED SWOM
        </h2>
        <p className="font-sans font-light">
          We believe in TRUST and we make it our main currency. We celebrate
          other cultures and value cross-cultural understanding. We believe that
          gaining knowledge about other cultures helps us be better informed
          citizens of the world and allows us to come together as one human
          family. We recognize that its important to create meaningful
          relationships with people from all walks of life, and that traveling
          is a way to do so. This is what moves us. Traveling is our way.
        </p>
      </div>

      <div className="py-8 px-4 relative md:w-[80%] justify-center m-auto gap-6 flex min-h-[30vh] md:min-h-[40vh]">
        <div className="relative w-1/3">
          <Image
            fill
            objectFit="cover"
            src="/about-us/about-3.png"
            alt="hero"
          />
        </div>
        <div className="relative w-1/3">
          <Image
            fill
            objectFit="cover"
            src="/about-us/about-4.png"
            alt="hero"
          />
        </div>
        <div className="relative w-1/3">
          <Image
            fill
            objectFit="cover"
            src="/about-us/about-5.png"
            alt="hero"
          />
        </div>
      </div>
    </main>
  );
};

export default Page;
