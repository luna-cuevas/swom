'use client';
import Carousel from '@/components/Carousel';
import Image from 'next/image';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  return (
    <main>
      <div className="">
        <div className="h-[87vh] bg-black relative">
          <div className="absolute w-fit z-50 h-fit top-0 bottom-0 left-0 right-0 m-auto ">
            <h2 className="text-[#ffffff] uppercase text-3xl tracking-widest text-center">
              Make Memories <br /> All over the <br /> world
            </h2>
          </div>
          <Carousel
            images={[
              '/homepage/hero-image-9.png',
              '/homepage/hero-image-1.png',
              '/homepage/hero-image-2.png',
              '/homepage/hero-image-3.png',
              '/homepage/hero-image-4.png',
              '/homepage/hero-image-5.png',
              '/homepage/hero-image-6.png',
              '/homepage/hero-image-7.png',
              '/homepage/hero-image-8.png',
            ]}
          />
        </div>
        <div className="flex bg-[#7F8119] flex-wrap   md:flex-row py-5  tracking-widest justify-center text-xl gap-2 md:gap-5">
          <p className="!text-[#EBDECC] font-sans">LONDON</p>
          <p className="!text-[#EBDECC] font-sans">•</p>
          <p className="!text-[#EBDECC] font-sans">PARIS</p>
          <p className="!text-[#EBDECC] font-sans">•</p>
          <p className="!text-[#EBDECC] font-sans">NEW YORK</p>
          <p className="!text-[#EBDECC] font-sans">•</p>
          <p className="!text-[#EBDECC] font-sans">VIETNAM</p>
          <p className="!text-[#EBDECC] font-sans">•</p>
          <p className="!text-[#EBDECC] font-sans">COLOMBIA</p>
          <p className="!text-[#EBDECC] font-sans">•</p>
          <p className="!text-[#EBDECC] font-sans">SWITZERLAND</p>
        </div>
      </div>

      <section className="md:h-[50vh] h-fit md:flex-row flex-col  flex px-10 align-middle md:gap-16  md:justify-evenly">
        <div className="md:w-[40%] h-fit md:my-auto my-4">
          <h2 className="text-4xl tracking-wider">Swom</h2>
          <p className="font-thin">(Verb): to swap you home.</p>
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
                style={{ borderRadius: '50%;' }}
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

      <section className="md:h-[45vh] py-6 md:flex-row flex-col justify-evenly flex bg-[#F4ECE8]">
        <div className="md:w-1/2 flex my-auto rounded-r-3xl bg-[#E88527] ">
          <div className="relative  w-11/12 h-[30vh]">
            <Image
              src="/homepage/cto-image.jpg"
              alt="cto image"
              className="rounded-r-3xl"
              fill
              objectFit="cover"></Image>
          </div>

          <svg
            className="m-auto"
            fill="#ffffff"
            height="20px"
            width="20px"
            version="1.1"
            id="Capa_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 492.432 492.432"
            xmlSpace="preserve">
            <g id="XMLID_134_">
              <path
                id="XMLID_135_"
                d="M142.238,492.432c-9.79,0-19.588-3.736-27.05-11.209c-14.945-14.934-14.945-39.162,0-54.098l180.9-180.909
		l-180.9-180.91c-14.945-14.935-14.945-39.163,0-54.098c14.926-14.944,39.172-14.944,54.098,0l207.96,207.958
		c14.943,14.935,14.943,39.164,0,54.1l-207.96,207.957C161.824,488.697,152.026,492.432,142.238,492.432z"
              />
            </g>
          </svg>
        </div>
        <div className="md:w-1/3 py-4  m-auto">
          <div className="relative justify-center m-auto w-1/2 h-[30px] flex ">
            <Image
              className="m-auto"
              src="/swom-logo.jpg"
              objectFit="contain"
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
              Become a Member
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
            <h2 className="text-4xl bold  shadow-2xl mb-4">Explore</h2>
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
            <button className="bg-[#E88527] rounded-3xl mx-auto md:mx-0 text-white h-fit w-fit py-2 px-8 my-auto">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="md:min-h-[1000px] py-6 h-full gap-4 overflow-hidden w-10/12 m-auto justify-center md:grid bg-white flex   flex-col  ">
        <div className="md:grid md:grid-cols-3 gap-4  h-[70%]">
          <div className="sm:grid flex flex-col grid-rows-4 gap-4">
            <div className="row-span-1 text-right">
              <h2 className="text-2xl word-wrap  h-fit">
                THE JOY OF <br /> BEGINNING
              </h2>
            </div>
            <div className="row-span-1">
              <p className="text-sm font-sans tracking-widest">
                HOME, SWEET HOME
              </p>
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
                objectFit="cover"
                alt="bottom image"
                fill></Image>
            </div>
          </div>

          <div className="sm:grid  flex flex-col grid-rows-4 gap-4">
            <div className="relative h-[40vh] sm:h-auto row-span-2">
              <Image
                src="/homepage/bottom-2.jpg"
                objectFit="cover"
                alt="bottom image"
                fill></Image>
            </div>
            <div className="relative h-[40vh] md:h-auto row-span-2">
              <Image
                src="/homepage/bottom-3.jpg"
                objectFit="cover"
                alt="bottom image"
                fill></Image>
            </div>
          </div>

          <div className="sm:grid flex flex-col grid-rows-5 gap-4">
            <div className="row-span-1 my-auto">
              <h2 className="text-3xl font-bold font-sans">
                A photo, a <br /> moment a <br /> short story
              </h2>
            </div>

            <div className="relative h-[40vh] md:h-auto  row-span-2">
              <Image
                src="/homepage/bottom-4.jpg"
                objectFit="cover"
                alt="bottom image"
                fill></Image>
            </div>

            <div className="relative h-[40vh] md:h-auto  row-span-2">
              <Image
                src="/homepage/bottom-5.jpg"
                objectFit="cover"
                alt="bottom image"
                fill></Image>
            </div>
          </div>
        </div>

        <div className=" my-4 flex">
          <div className="relative flex-col md:flex-row  w-full py-4  justify-evenly align-middle px-8 m-auto border-l-0 rounded-xl  flex border-2 border-[#7F8119]">
            <h2 className="h-fit m-auto text-2xl md:w-2/3 font-bold font-sans">
              BE PART OF A HARMONIOUS COOPERATIVE GLOBAL COMMUNITY
            </h2>
            <p className="h-fit text-xl m-auto md:w-6/12">
              Opening your home to others fosters your capacity for trust and
              generosity.
            </p>
          </div>

          <div className="relative hidden lg:flex w-1/3 h-2/3 xl:h-full my-auto">
            <Image
              src="/homepage/bottom-logo.jpg"
              objectFit="contain"
              alt="bottom image"
              fill></Image>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Page;
