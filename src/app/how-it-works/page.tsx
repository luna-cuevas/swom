import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {};

const Page: React.FC<Props> = (props) => {
  return (
    <main
      style={{
        background:
          'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(244,236,232,1) 100%)',
      }}
      className="relative flex flex-col">
      <header className="lg:w-3/4 w-11/12 mx-auto h-[30vh] flex  justify-center  align-middle">
        <div className="h-fit flex flex-col md:flex-row m-auto justify-center gap-10">
          <h1 className="h-fit my-auto text-[#406976] mx-auto md:mx-0 flex font-thin text-xl  md:text-4xl uppercase font-sans tracking-[0.3rem] w-fit ">
            How it works
          </h1>
          <p className="md:w-[45%] text-xl text-[#406976]  h-fit font-sans">
            Members-only community of travelers around the globe. Exchange your
            home for free, for travel, for work, for fun!
          </p>
        </div>
      </header>

      <div className="md:w-11/12 w-full pr-4 my-4 flex flex-col relative py-4  ">
        <div className="border-r-2 border-y-2 relative rounded-r-3xl border-[#7F8119]">
          <div className="absolute h-[200%] xl:max-h-[60vh] max-h-[50vh] w-1/3 md:w-1/2">
            <Image
              src="/how-it-works/hiw-bg-1.png"
              alt="hero"
              fill
              objectFit="contain"
            />
          </div>
          <div
            className="w-1/2 ml-auto"
            style={{ padding: '26.25% 0 0 0', position: 'relative' }}>
            <iframe
              src="https://player.vimeo.com/video/726050137?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
              allow="autoplay; fullscreen; picture-in-picture"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
              title="SWOM_SWAP YOUR HOME"></iframe>
          </div>
          <script src="https://player.vimeo.com/api/player.js"></script>
        </div>

        <div className="flex w-full gap-4 h-fit">
          <div className=" md:w-9/12 mt-20 flex flex-col">
            <h3 className="uppercase text-[#7F8119] leading-[50px] mb-20 tracking-[0.4rem] w-full text-right border-b-2 border-[#7F8119] text-3xl ml-auto">
              Follow these <br />{' '}
              <strong className="text-[#7F8119]">simple steps</strong>{' '}
            </h3>
            <div className="grid pl-[10%] h-fit grid-cols-2">
              <div className="col-start-2">
                <h1 className="text-7xl font-bold font-sans">1</h1>
                <p className="text-2xl">
                  Apply by filling out the simple form. It will take you 6
                  minutes. We will get in touch with you once we review your
                  application.{' '}
                </p>
              </div>
              <div className="col-start-1 w-1/2 col-span-2">
                <h1 className="text-7xl font-bold font-sans">2</h1>
                <p className="text-2xl">
                  Once you have been granted a username and password you can
                  sign in. You will then make a membership payment. After that
                  you will be able to create a personal profile and listing
                  following a few simple steps.
                </p>
              </div>
              <div className="col-start-2">
                <h1 className="text-7xl font-bold font-sans">3</h1>
                <p className="text-2xl">
                  You can browse and discover SWOM homes from around the world.
                  Get in touch with other members by using the messaging system
                  and make your traveling dreams come true.
                </p>
              </div>
              <div className="col-start-1">
                <h1 className="text-7xl font-bold font-sans">4</h1>
                <p className="text-2xl">
                  ...but not least, once you agree on dates and details of the
                  exchange you are ready to SWOM!! (Verb. To travel the world
                  swapping homes.)
                </p>
              </div>
            </div>
          </div>
          <div className="w-3/12 md:flex hidden mt-20 gap-4 min-h-screen  flex-col">
            <div className="relative h-1/3 w-full">
              <Image
                src="/how-it-works/step-image-2.png"
                alt="hero"
                fill
                objectFit="cover"
              />
            </div>
            <div className="relative h-1/3">
              <Image
                src="/how-it-works/step-image-1.png"
                alt="hero"
                fill
                objectFit="cover"
              />
            </div>
            <div className="relative h-1/3">
              <Image
                src="/how-it-works/step-image-3.png"
                alt="hero"
                fill
                objectFit="cover"
              />
            </div>
          </div>
        </div>
        <button className="text-xl font-bold tracking-wider mt-16 hover:bg-[#7f8119d3] text-white rounded-3xl uppercase px-4 py-2 bg-[#7F8119] w-fit mx-auto">
          Questionnaire
        </button>
      </div>
      <div className="bg-[#EB8828] flex my-10 mb-20 relative w-2/3 h-fit py-10 rounded-l-3xl ml-auto">
        <div className="absolute h-[120%]  right-full max-h-[50vh]  w-[250px] -top-6 ">
          <Image
            src="/how-it-works/bottom-img.png"
            alt="hero"
            fill
            objectPosition="top"
            objectFit="cover"
          />
        </div>

        <div className="flex flex-col m-auto w-3/4">
          <h2 className="tracking-[0.4rem] opacity-90 mb-2 text-3xl text-white uppercase font-sans">
            We love to help
          </h2>
          <p className="flex-wrap gap-1 flex opacity-80  text-white text-lg font-sans">
            Our team is ready to help in any situation. Whether it is to apply
            or create a profile, rest assured that we will be there every step
            of the way. Contact us{' '}
            <span>
              <Link
                className="text-blue-800"
                href="mailto:info@swom.travel"
                target="_blank"
                rel="noopener noreferrer">
                info@swom.travel
              </Link>
            </span>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Page;
