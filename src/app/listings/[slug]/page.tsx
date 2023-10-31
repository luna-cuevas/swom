'use client';
import CarouselPage from '@/components/Carousel';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import GoogleMapComponent from '@/components/GoogleMapComponent';

type Props = {};

const Page = (props: Props) => {
  const pathName = usePathname();
  const slug = pathName.split('/listings/')[1];
  const [mapsActive, setMapsActive] = useState(true);

  return (
    <main className="px-[5%] py-[2%] bg-[#F7F1EE]">
      {/* title section */}
      <div className="m-auto border-y-[1px] py-4 border-[#172544] justify-between flex">
        <h1 className="text-2xl font-thin">City, Country</h1>
        <div className="relative w-[30px] h-[30px]">
          <Image
            fill
            objectFit="contain"
            className="h-full"
            src="/logo-icons.png"
            alt=""
          />
        </div>
      </div>

      {/* Listing Info Above Fold */}
      <div className="flex my-8 justify-between">
        {/* User Info - Left Section */}
        <div className="w-[25%]  flex flex-col">
          <h2 className="font-sans mx-auto mb-8 font-light text-2xl border border-[#172544] py-2 px-8 rounded-xl w-fit">
            Listing <span className="font-bold"> No. {slug}</span>
          </h2>

          <div className="mx-auto text-center">
            <div className="relative m-auto  h-[100px] w-[100px]">
              <Image fill src="/profile/profile-pic-placeholder.png" alt="" />
            </div>
            <h3 className="text-xl">User Name</h3>
            <p className="font-bold font-sans">Profession</p>
            <p className="font-sans">Age</p>
            <button className="bg-[#E78426] hover:bg-[#e78326d8] text-[#fff]  my-2 px-3 py-1 rounded-xl">
              Contact me
            </button>
          </div>

          <div className="my-2">
            <h4 className="font-serif text-xl font-thin border-b border-[#172544] mb-2">
              About us
            </h4>
            <p>
              We are, lorem ipsum dolor sit amet, consectetuer Lorem ipsum dolor
              sit amet, consectetuer adi- piscing elit, sed diam nonummy
            </p>
          </div>

          <div className="my-2">
            <h4 className="font-serif text-xl font-thin border-b border-[#172544] mb-2">
              We want to go to
            </h4>
            <ul>
              <li>City</li>
              <li>City</li>
              <li>City</li>
            </ul>
          </div>

          <div className="my-2">
            <h4 className="font-serif text-xl font-thin border-b border-[#172544] mb-2">
              Open to other destinations
            </h4>
            <p>Yes</p>
          </div>
        </div>

        {/* Listing Info - Right Section */}
        <div className="w-2/3 flex flex-col">
          <div className="flex flex-col  h-[40vh] w-full mx-auto">
            <CarouselPage
              images={[
                { src: '/homepage/hero-image-1.png' },
                { src: '/homepage/hero-image-2.png' },
                { src: '/homepage/hero-image-3.png' },
              ]}
              picturesPerSlide={1}
            />
          </div>

          <div className="flex gap-4 my-4">
            {[
              '/homepage/hero-image-1.png',
              '/homepage/hero-image-2.png',
              '/homepage/hero-image-3.png',
            ].map((image, id) => (
              <div key={id} className="relative h-[200px] w-1/3">
                <Image
                  fill
                  objectFit="cover"
                  className="rounded-xl"
                  src={image}
                  alt=""
                />
              </div>
            ))}
          </div>

          <div className="flex border-t border-[#172544]">
            <div className="w-1/2 mt-4">
              <h4>About the City</h4>
              <p>
                Monteria is beautiful, dolor sit amet, consectetuer adipiscing
                elit, sed diam nonummy nibh euismod tin- cidunt ut laoreet
                dolore magna aliquam erat volutpat. Ut wisi enim ad minim
                veniam, quis nostrud exerci tation ullamcorper suscipit lobortis
                nisl ut aliquip ex ea commodo consequat. Duis autem vel eum
                iriure dolor in hen
              </p>
            </div>
            <div className=" h-[80%] mx-6 my-auto border border-[#172544]" />
            <div className="w-1/2 mt-4">
              <h4>About my home</h4>
              <p>
                This swom is, dolor sit amet, consectetuer adipiscing elit, sed
                diam nonummy nibh euismod tincidunt ut laoreet dolore magna
                aliquam erat volutpat. Ut wisi enim ad minim veniam, quis
                nostrud exerci tation ullamcorper suscipit lobortis nisl ut
                aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor
                in hen
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Below the Fold */}
      <div className="py-2 border-y-[1px] border-[#172544]">
        <div className=" border my-8 border-[#172544] rounded-xl grid grid-cols-3 text-center py-8 justify-evenly">
          <div className="border-r border-[#172544]">
            <div className="relative my-1 m-auto w-[40px] h-[40px]">
              <Image
                fill
                objectFit="contain"
                src="/listings/slug/apartments-icon.png"
                alt=""
              />
            </div>
            <h3 className="font-bold">Type of property</h3>
            <p>Apartment</p>
          </div>
          <div className="border-r border-[#172544]">
            <div className="relative my-1 m-auto w-[40px] h-[40px]">
              <Image
                fill
                objectFit="contain"
                src="/listings/slug/bedroom-icon.png"
                alt=""
              />
            </div>
            <h3 className="font-bold">Bedroom 2</h3>
            <p>2 double bed</p>
          </div>
          <div className="">
            <div className="relative my-1 m-auto w-[40px] h-[40px]">
              <Image
                fill
                objectFit="contain"
                src="/listings/slug/location-icon.png"
                alt=""
              />
            </div>
            <h3 className="font-bold">Property located in</h3>
            <p>Condominium</p>
          </div>
        </div>

        <div className=" border my-8 border-[#172544] rounded-xl grid grid-cols-3 text-center py-8 justify-evenly">
          <div className="border-r border-[#172544]">
            <div className="relative my-1 m-auto w-[40px] h-[40px]">
              <Image
                fill
                objectFit="contain"
                src="/listings/slug/finger-icon.png"
                alt=""
              />
            </div>
            <h3 className="font-bold">Kind of property</h3>
            <p>Main Property</p>
          </div>
          <div className="border-r border-[#172544]">
            <div className="relative my-1 m-auto w-[40px] h-[40px]">
              <Image
                fill
                objectFit="contain"
                src="/listings/slug/bathroom-icon.png"
                alt=""
              />
            </div>
            <h3 className="font-bold">Bathrooms</h3>
            <p>3 bathrooms</p>
          </div>
          <div className="">
            <div className="relative my-1 m-auto w-[40px] h-[40px]">
              <Image
                fill
                objectFit="contain"
                src="/listings/slug/square-icon.png"
                alt=""
              />
            </div>
            <h3 className="font-bold">Area</h3>
            <p>100 mts2</p>
          </div>
        </div>
      </div>

      <div className="my-2">
        <button
          onClick={() => {
            console.log('clicked');
            setMapsActive(!mapsActive);
          }}
          className="text-2xl flex justify-between w-full text-left my-4 pb-4 border-b border-[#172544] font-serif">
          <h2>Where is it?</h2>
          {/* arrow down that switches to up when button active */}
          <svg
            className={`w-6 h-6 inline-block ${
              mapsActive && 'rotate-180 transform'
            }`}
            viewBox="0 0 20 20">
            <path
              fill="#172544"
              d="M10 12.586L4.707 7.293a1 1 0 011.414-1.414L10 9.758l4.879-4.879a1 1 0 111.414 1.414L10 12.586z"
            />
          </svg>
        </button>
        <div className={`w-full h-[30vh] ${mapsActive ? 'block' : 'hidden'}`}>
          <GoogleMapComponent />
        </div>
      </div>

      <div>
        <h2 className="text-2xl flex justify-between w-full text-left my-4 py-4 border-y-[1px] border-[#172544] font-serif">
          Amenities & advantages
        </h2>
        <div className="flex gap-[5%]">
          <ul className="flex flex-col gap-2">
            <li>TV</li>
            <li>Dishwasher</li>
            <li>Coworking</li>
            <li>Wifi</li>
            <li>Pool</li>
          </ul>
          <ul className="flex flex-col gap-2">
            <li>Video Games</li>
            <li>Elevator</li>
            <li>Terrace</li>
            <li>Cleaning service</li>
            <li>Fireplace</li>
          </ul>
        </div>
        <button className="font-sans hover:bg-[#fff] text-base my-8 py-2 px-4 border border-[#172544] rounded-xl">
          Show all xx services
        </button>
      </div>
    </main>
  );
};

export default Page;
