'use client';
import CarouselPage from '@/components/Carousel';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { supabaseClient } from '../../../utils/supabaseClient';
import cityData from '@/data/citiesDescriptions.json';

type Props = {};

const Page = (props: Props) => {
  const pathName = usePathname();
  const slug = pathName.split('/listings/')[1];
  const [mapsActive, setMapsActive] = useState(true);
  const [listings, setListings] = useState<any>([]);
  const supabase = supabaseClient();
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0); // Track selected image

  const fetchListings = async () => {
    try {
      // Replace 'listings' with your actual table name
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', slug);

      console.log('data', data);

      if (error) {
        throw error;
      }

      const userInfo = data[0]?.userInfo;
      const dob = new Date(userInfo?.dob);
      const today = new Date();
      const age =
        today.getFullYear() -
        dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
          ? 1
          : 0);

      console.log('dob', age);

      const updatedData = data.map((item: any) => ({
        ...item,
        userInfo: {
          ...item.userInfo,
          age: age,
        },
      }));

      setListings(updatedData);
      setImageFiles(data[0]?.homeInfo?.listingImages);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    }
  };

  const checkCityDescription = (city: string) => {
    const cityDescription = cityData.find(
      (cityObj: any) => cityObj.city === city
    );
    return cityDescription?.description ?? 'No description available';
  };

  useEffect(() => {
    fetchListings();
  }, []);

  console.log('listings', listings);

  return (
    <main className="px-[5%] py-[2%] bg-[#F7F1EE]">
      {/* title section */}
      <div className="m-auto border-y-[1px] py-4 border-[#172544] justify-between flex">
        <h1 className="text-2xl font-thin">
          {listings[0]?.homeInfo?.title} <br />
          <span className="font-bold"> {listings[0]?.homeInfo?.city}</span>
        </h1>
        <div className="relative w-[30px] flex align-middle my-auto h-[30px]">
          <Image
            fill
            objectFit="contain"
            className="h-full m-auto"
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
            Listing <span className="font-bold"> No. {slug.slice(-5)}</span>
          </h2>

          <div className="mx-auto text-center">
            <div className="relative m-auto  h-[100px] w-[100px]">
              <Image fill src="/profile/profile-pic-placeholder.png" alt="" />
            </div>
            <h3 className="text-xl">{listings[0]?.userInfo?.name}</h3>
            <p className="font-bold font-sans">
              {listings[0]?.userInfo?.profession}
            </p>
            <p className="font-sans">
              {listings[0]?.userInfo?.age
                ? `${listings[0]?.userInfo?.age} years old`
                : ''}
            </p>
            <button className="bg-[#E78426] hover:bg-[#e78326d8] text-[#fff]  my-2 px-3 py-1 rounded-xl">
              Contact me
            </button>
          </div>

          <div className="my-2">
            <h4 className="font-serif text-xl font-thin border-b border-[#172544] mb-2">
              About us
            </h4>
            <p>{listings[0]?.userInfo?.about_me}</p>
          </div>

          {listings[0]?.userInfo?.citiesToGo && (
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
          )}

          <div className="my-2">
            <h4 className="font-serif text-xl font-thin border-b border-[#172544] mb-2">
              Open to other destinations
            </h4>
            {listings[0]?.userInfo?.openToOtherCities &&
              Object.values(listings[0]?.userInfo?.openToOtherCities).map(
                // @ts-ignore
                (city: string) => <p key={city}>{city}</p>
              )}
          </div>
        </div>

        {/* Listing Info - Right Section */}
        <div className="w-2/3 flex flex-col">
          <div className="flex flex-col relative h-[40vh] w-full mx-auto">
            <Image
              src={
                imageFiles[selectedImage]
                  ? imageFiles[selectedImage]
                  : '/placeholder.png'
              }
              alt=""
              className="rounded-3xl object-cover "
              fill
              objectPosition="center"
            />
          </div>

          <div className="flex relative h-[30vh] gap-4 my-4">
            {imageFiles.length > 0 && (
              <CarouselPage
                picturesPerSlide={3}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                overlay={false}
                contain={false}
                images={imageFiles.map((file) => ({
                  src: file.toString(),
                }))}
              />
            )}
          </div>

          <div className="flex border-t border-[#172544]">
            <div className="w-1/2 mt-4">
              <h4>About the City</h4>
              <p>{checkCityDescription(listings[0]?.homeInfo?.city)}</p>
            </div>
            <div className=" h-[80%] mx-6 my-auto border border-[#172544]" />
            <div className="w-1/2 mt-4">
              <h4>About my home</h4>
              <p>{listings[0]?.homeInfo?.description}</p>
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
            <p className="capitalize text-xl">
              {listings[0]?.homeInfo?.property}
            </p>
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
            <h3 className="font-bold">Bedrooms</h3>
            <p className="text-xl">{listings[0]?.homeInfo?.howManySleep}</p>
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
            <p className="capitalize text-xl">
              {listings[0]?.homeInfo?.locatedIn}
            </p>
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
            <p className="capitalize text-xl">
              {listings[0]?.homeInfo?.mainOrSecond}
            </p>
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
            <p className="text-xl">{listings[0]?.homeInfo?.bathrooms}</p>
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
            <p className="text-xl">
              {listings[0]?.homeInfo?.area
                ? `${listings[0]?.homeInfo?.area} sqm`
                : ''}
            </p>
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
        <div
          className={`w-full p-4 h-[40vh] ${mapsActive ? 'block' : 'hidden'}`}>
          {listings[0]?.homeInfo?.city && (
            <GoogleMapComponent
              city={listings[0].homeInfo.city}
              noSearch={true}
            />
          )}
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl flex justify-between w-full text-left my-4 py-4 border-y-[1px] border-[#172544] font-serif">
          Amenities & advantages
        </h2>
        <div className="flex gap-[5%]">
          <ul className="flex flex-col gap-2">
            {listings[0]?.amenities &&
              Object.entries(listings[0]?.amenities).map(([key, value]) => {
                if (value === true) {
                  return <li className="capitalize">{key}</li>;
                }
                return null;
              })}
          </ul>
        </div>
        {/* <button className="font-sans hover:bg-[#fff] text-base my-8 py-2 px-4 border border-[#172544] rounded-xl">
          Show all xx services
        </button> */}
      </div>
    </main>
  );
};

export default Page;
