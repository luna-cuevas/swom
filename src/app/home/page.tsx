import Carousel from '@/components/Carousel';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { sanityClient } from '../../../sanity/lib/client';
import { urlForImage } from '../../../sanity/lib/image';

type Props = {};

const Page = async (props: Props) => {
  // const updatePassword = async () => {
  //   const { data: user, error } = await supabase.auth.admin.updateUserById(
  //     'f9afa7b8-8005-454e-a74e-8e71670e2ce3',
  //     { password: 'password' }
  //   );
  //   if (error) console.log(error);
  //   else console.log(user);
  // };
  // updatePassword();

  // const highlightedListings = await fetchListings();

  // const [listings, setListings] = useState([]);

  // useEffect(() => {
  //   const fetchListings = async () => {
  //     try {
  //       const response = await fetch('api/getHighlightedListings');
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const data = await response.json();

  //       const updatedData = data.map((listing: any) => {
  //         return {
  //           ...listing,
  //           homeInfo: {
  //             ...listing.homeInfo,
  //             firstImage: urlForImage(listing.homeInfo.firstImage),
  //           },
  //         };
  //       });

  //       setListings(updatedData);
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setListings([]);
  //     }
  //   };

  //   fetchListings();
  // }, []);

  return (
    <main
      style={{
        background: '#F7F1EE',
      }}>
      <div className="">
        <div className="h-[80vh] bg-black relative">
          <div className="absolute w-fit z-50 h-fit top-0 bottom-0 left-0 right-0 m-auto ">
            <h1 className="text-[#ffffff] font-bold uppercase text-4xl tracking-widest text-center">
              Make Memories <br /> All over the <br /> world
            </h1>
          </div>
          <Carousel
            images={
              // listings?.map((listing: any) => {
              // return {
              //   src: listing.homeInfo.firstImage,
              //   listingNum: listing._id,
              // };
              // })
              [
                { src: '/homepage/hero-image-1.png', listingNum: '5201' },
                { src: '/homepage/hero-image-2.png', listingNum: '103' },
                { src: '/homepage/hero-image-3.png', listingNum: '5702' },
                { src: '/homepage/hero-image-4.png', listingNum: '102' },
                { src: '/homepage/hero-image-5.png', listingNum: '3401' },
                { src: '/homepage/hero-image-6.png', listingNum: '5704' },
                { src: '/homepage/hero-image-7.png', listingNum: '35801' },
                { src: '/homepage/hero-image-8.png', listingNum: '6101' },
                { src: '/homepage/hero-image-9.png', listingNum: '5202' },
              ]
            }
            picturesPerSlide={1}
            overlay={true}
          />
        </div>
        <div className="flex bg-[#7F8119] flex-wrap   md:flex-row py-5  tracking-widest justify-center text-xl gap-2 md:gap-5">
          <p className="!text-[#fff] font-sans">LONDON</p>
          <p className="!text-[#fff] font-sans">•</p>
          <p className="!text-[#fff] font-sans">PARIS</p>
          <p className="!text-[#fff] font-sans">•</p>
          <p className="!text-[#fff] font-sans">NEW YORK</p>
          <p className="!text-[#fff] font-sans">•</p>
          <p className="!text-[#fff] font-sans">VIETNAM</p>
          <p className="!text-[#fff] font-sans">•</p>
          <p className="!text-[#fff] font-sans">COLOMBIA</p>
          <p className="!text-[#fff] font-sans">•</p>
          <p className="!text-[#fff] font-sans">SWITZERLAND</p>
        </div>
      </div>

      <section className="md:h-[50vh] bg-[#F4ECE8] h-fit md:flex-row flex-col  flex px-10 align-middle md:gap-16  md:justify-evenly">
        <div className="md:w-[40%] h-fit md:my-auto my-4">
          <h1 className="text-4xl tracking-wider uppercase">Swom</h1>
          <h2 className="font-thin">(Verb): to swap you home.</h2>
          <p className="mt-6 text-xl">
            Get ready to SWOM your way to a whole new address and a suitcase
            full of memories.
          </p>
        </div>
        <div className="md:w-1/4 md:my-auto my-4 relative h-[200px] ">
          <div className="circle-button">
            <div className="main_circle_text">
              <svg
                viewBox="0 -4 100 100"
                style={{ borderRadius: '50%' }}
                width="200"
                height="200">
                <defs>
                  <path
                    id="circle"
                    d="
                        M 50, 50
                        m -37, 0
                        a 37,37 0 1,1 74,0
                        a 37,37 0 1,1 -74,0"
                  />
                </defs>

                <text>
                  <textPath xlinkHref="#circle">
                    WE CELEBRATE OTHER CULTURES
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="md:h-[45vh]  md:flex-row flex-col justify-evenly flex bg-[#F4ECE8]">
        <div className="md:w-1/2 h-[30vh] md:h-full flex my-auto relative">
          <div className="w-full relative h-full overflow-hidden">
            <div className="absolute z-50 top-[10%] -left-4 text-md ">
              <div className="absolute inset-0 transform skew-x-[-10deg]  bg-[#f4ece7b3]"></div>
              <div className="relative py-4 px-8 text-[#172544]">
                <strong>Listing No. 5704</strong>
              </div>
            </div>
            <Image
              src="/homepage/hero-image-6.png"
              alt="cto image"
              fill
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 gradient-mask"></div>
          </div>
        </div>

        <div className="md:w-1/3 p-4  m-auto">
          <div className="relative justify-center m-auto w-1/2 h-[30px] flex ">
            <Image
              className="m-auto object-contain"
              src="/swom-logo.jpg"
              alt="swom logo"
              fill></Image>
          </div>
          <div className="w-fit justify-center text-center">
            <p className="">Swap your home</p>

            <p className="my-4">
              Welcome to our members-only community of travelers around the
              globe.{' '}
              <strong>
                Exchange your home for free, for travel, for work, for fun!
              </strong>
            </p>
            <button className="bg-[#172544] text-[#EBDECC] px-4 py-2 rounded-3xl">
              <Link href="/become-member">Become a Member</Link>
            </button>
          </div>
        </div>
      </section>

      <section
        style={{
          backgroundImage: 'url(/homepage/explore-bg.png)',
          backgroundSize: 'cover',
        }}
        className="md:h-[30vh] py-6  m-auto justify-center  flex flex-col">
        <div className="w-2/3 m-auto">
          <div className="w-fit ">
            <h1 className="text-4xl font-bold  mb-4">Explore</h1>
          </div>
          <form className="md:grid w-full flex flex-col justify-center md:grid-cols-6 gap-4">
            <input
              className="bg-[#F4ECE8] rounded-xl p-3 col-span-2"
              placeholder="Location"
              type="text"
            />
            <input
              className="bg-[#F4ECE8] rounded-xl p-3 col-span-2"
              placeholder="Anytime"
              type="text"
            />
            <select className="bg-[#F4ECE8] text-center" name="" id="">
              <option value="1">1 Guest</option>
              <option value="2">2 Guest</option>
              <option value="3">3 Guest</option>
            </select>
            <Link
              href={'/become-member'}
              className="bg-[#E88527] rounded-3xl mx-auto md:mx-0 text-white h-fit w-fit py-2 px-8 my-auto">
              Search
            </Link>
          </form>
        </div>
      </section>

      <section className="md:min-h-[1000px] py-6 h-full gap-4 overflow-hidden w-10/12 m-auto justify-center md:grid  flex   flex-col  ">
        <div className="md:grid md:grid-cols-3 gap-4  h-[70%]">
          <div className="sm:grid flex flex-col grid-rows-4 gap-4">
            <div className="row-span-1 text-right">
              <h1 className="text-2xl word-wrap  h-fit">
                THE JOY OF <br /> BEGINNING
              </h1>
            </div>
            <div className="row-span-1">
              <h2 className="text-lg font-sans tracking-widest">
                HOME, SWEET HOME
              </h2>
              <h1 className="text-4xl  font-bold font-sans my-6">
                WE ARE A REVOLUTION IN THE WAY OF TRAVELING
              </h1>
              <p className="text-xl">
                Get ready to gain diverse cultural experiences and broaden your
                perspective on life
              </p>
            </div>
            <div className="relative h-[40vh] md:h-full row-span-3">
              <Image
                src="/homepage/bottom-1.jpg"
                className="object-cover"
                alt="bottom image"
                fill></Image>
            </div>
          </div>

          <div className="sm:grid  flex flex-col grid-rows-4 gap-4">
            <div className="relative h-[40vh] sm:h-auto row-span-2">
              <Image
                src="/homepage/bottom-2.jpg"
                className="object-cover"
                alt="bottom image"
                fill></Image>
            </div>
            <div className="relative h-[40vh] md:h-auto row-span-2">
              <Image
                src="/homepage/bottom-3.jpg"
                className="object-cover"
                alt="bottom image"
                fill></Image>
            </div>
          </div>

          <div className="sm:grid flex flex-col grid-rows-5 gap-4">
            <div className="row-span-1 my-auto">
              <h1 className="text-3xl font-bold font-sans">
                A photo, a <br /> moment a <br /> short story
              </h1>
            </div>

            <div className="relative h-[40vh] md:h-auto  row-span-2">
              <Image
                src="/homepage/bottom-4.jpg"
                className="object-cover"
                alt="bottom image"
                fill></Image>
            </div>

            <div className="relative h-[40vh] md:h-auto  row-span-2">
              <Image
                src="/homepage/bottom-5.jpg"
                className="object-cover"
                alt="bottom image"
                fill></Image>
            </div>
          </div>
        </div>

        <div className=" my-4 flex">
          <div className="relative flex-col md:flex-row  w-full py-4  justify-evenly align-middle px-8 m-auto border-l-0 rounded-xl  flex border-2 border-[#7F8119]">
            <h1 className="h-fit m-auto text-2xl md:w-2/3 font-bold font-sans">
              BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY
            </h1>
            <p className="h-fit text-xl m-auto md:w-6/12">
              Opening your home to others fosters your capacity for trust and
              generosity.
            </p>
          </div>

          <div className="relative hidden object-contain lg:flex w-1/3 h-2/3 xl:h-full my-auto">
            <Image
              src="/homepage/bottom-logo.png"
              className="object-contain"
              alt="bottom image"
              fill></Image>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
