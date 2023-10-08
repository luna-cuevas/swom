'use client';
import CarouselPage from '@/components/Carousel';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import Image from 'next/image';
import React from 'react';

type Props = {};

const Page = (props: Props) => {
  return (
    <main className="bg-[#F7F1EE]">
      <div className="py-8 px-16 flex justify-center">
        <div className="w-1/4 flex justify-center text-center flex-col">
          <div className="relative w-[80px] my-4 mx-auto h-[80px]">
            <Image
              src="/profile/profile-pic-placeholder.png"
              alt="hero"
              fill
              objectPosition="bottom"
              objectFit="cover"
            />
            <div className="absolute bg-[#F87C1B] rounded-full w-[30px] -right-2 align-middle my-auto flex h-[30px]">
              <Image
                fill
                objectFit="contain"
                // make the pencil white
                className="m-auto filter-invert"
                src="https://img.icons8.com/ios/50/000000/pencil-tip.png"
                alt=""
              />
            </div>
          </div>
          <h2 className="font-serif text-4xl ">User Name</h2>
          <p className="font-sans my-1 font-bold uppercase tracking-[0.1rem]">
            Profession
          </p>
          <p className="font-sans  uppercase">Age</p>
        </div>
        <div className="w-3/4">
          <div className="grid py-2 text-center grid-cols-5 border-b border-[#172544]">
            <h3>First Name</h3>
            <h3>Last Name</h3>
            <h3>User Name</h3>
            <h3>Age</h3>
            <h3>Profession</h3>
          </div>
          <div className="grid py-2 text-center grid-cols-5 border-b border-[#172544]">
            <h3>XX</h3>
            <h3>XX</h3>
            <h3>XX</h3>
            <h3>XX</h3>
            <h3>XX</h3>
          </div>
          <div className="flex justify-between py-2 border-b border-[#172544]">
            <h2>About you</h2>

            <button>
              <div className="relative w-[30px] align-middle my-auto flex h-[30px]">
                <Image
                  fill
                  objectFit="contain"
                  className="m-auto"
                  src="https://img.icons8.com/ios/50/000000/pencil-tip.png"
                  alt=""
                />
              </div>
            </button>
          </div>
          <p className="my-4">
            I’m xxx, dolor sit amet, consectetuer adipiscing elit, sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
            ullamcorper suscipit lobortis.
          </p>

          <div className="flex justify-between py-4 border-y border-[#172544]">
            <h4 className="text-2xl font-serif italic">
              Where would you like to go?
            </h4>
            <input
              className="bg-transparent rounded-xl border w-1/2 border-[#172544]"
              type="text"
            />
          </div>

          <div className="flex flex-col justify-between py-4 ">
            <h4 className="text-2xl font-serif italic">
              Open to other destinations?
            </h4>
            <div className="flex my-2">
              <input
                className="appearance-none h-fit my-auto bg-transparent checked:bg-[#7F8119] rounded-full border border-[#172544] p-2 mx-2"
                type="radio"
                id="yesRadio"
                name="choice"
              />
              <label htmlFor="yesRadio">Yes</label>

              <input
                className="appearance-none ml-4 h-fit my-auto bg-transparent checked:bg-[#7F8119] rounded-full border border-[#172544] p-2 mx-2"
                type="radio"
                id="noRadio"
                name="choice"
              />
              <label htmlFor="noRadio">No</label>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col px-16 m-auto">
        <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl">Cartagena, Colombia</h2>
          <div className="flex w-1/4 justify-evenly">
            <div className="relative w-[20px] my-auto h-[20px]">
              <Image
                fill
                objectFit="contain"
                className="h-full"
                src="/logo-icons.png"
                alt=""
              />
            </div>
            <h2 className="text-xl my-auto font-sans">
              Listing <span className="font-bold">No. XXX</span>
            </h2>
            <button
              className="ml-4 bg-[#FE8217] my-auto py-2 px-4 text-white rounded-xl"
              onClick={() => {
                console.log('click');
              }}
              type="button">
              Upload
            </button>
          </div>
        </div>
        <div>
          <div className="relative mt-8 mb-6 w-[95%] mx-auto h-[50vh]">
            <Image
              src="/homepage/hero-image-1.png"
              alt=""
              className="rounded-3xl"
              fill
              objectPosition="bottom"
              objectFit="cover"
            />
          </div>

          <div className="relative w-[95%] mx-auto h-[20vh]">
            <CarouselPage
              picturesPerSlide={3}
              images={[
                { src: '/homepage/hero-image-1.png' },
                { src: '/homepage/hero-image-2.png' },
                { src: '/homepage/hero-image-3.png' },
                { src: '/homepage/hero-image-3.png' },
                { src: '/homepage/hero-image-2.png' },
                { src: '/homepage/hero-image-1.png' },
              ]}
            />
          </div>

          <div className="flex my-4  border-b border-[#172544] py-4 justify-between">
            <h2 className="text-xl italic font-serif">Name of the city</h2>
          </div>

          <div className="w-full flex p-2 my-4  rounded-xl border border-[#172544]">
            <input
              className=" bg-transparent w-full outline-none"
              type="text"
              placeholder="What's the city?"
            />
            <img
              className="w-[20px] my-auto h-[20px]"
              src="/search-icon.svg"
              alt=""
            />
          </div>
        </div>
        <p className="font-sans text-sm my-6">
          Cartagena is dolor sit amet, consectetuer adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
          volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
          ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
          Duis autem vel eum iriure dolor in hen. Lorem ipsum dolor sit amet,
          consec- tetuer adipiscing elit, sed diam nonummy nibh euismod
          tincidunt ut laoreet dolore magna aliquam erat volutpat.
        </p>

        <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl italic font-serif">Tell us about your home</h2>
        </div>

        <p className="font-sans text-sm my-6">
          Villa linda is dolor sit amet, consectetuer adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
          volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
          ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.
          Duis autem vel eum iriure dolor in hen. Lorem ipsum dolor sit amet,
          consec- tetuer adipiscing elit, sed diam nonummy nibh euismod
          tincidunt ut laoreet dolore magna aliquam erat volutpat.
        </p>

        <div className="px-8 py-4 flex border rounded-xl my-8 border-[#172544]">
          <div className="flex flex-col text-center justify-center h-full w-1/3 border-r border-[#172544]">
            <label className="font-bold" htmlFor="property">
              Type of property*
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              name="property"
              id="property">
              <option value="">House</option>
              <option value="">Apartment</option>
              <option value="">Condo</option>
              <option value="">Townhouse</option>
            </select>
          </div>

          <div className="flex flex-col text-center justify-center h-full w-1/3 border-r border-[#172544]">
            <label className="font-bold" htmlFor="bedrooms">
              Bedrooms
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              name="bedrooms"
              id="bedrooms">
              <option value="">1</option>
              <option value="">2</option>
              <option value="">3</option>
              <option value="">4+</option>
            </select>
          </div>

          <div className="flex flex-col text-center justify-center h-full w-1/3 ">
            <label className="font-bold" htmlFor="locatedIn">
              Property located in
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              name="locatedIn"
              id="locatedIn">
              <option value="">a condiminium</option>
              <option value="">a gated community</option>
              <option value="">a neighborhood</option>
              <option value="">a rural area</option>
            </select>
          </div>
        </div>

        <div className="px-8 py-4 flex border rounded-xl my-8 border-[#172544]">
          <div className="flex flex-col text-center justify-center h-full w-1/3 border-r border-[#172544]">
            <label className="font-bold" htmlFor="kindOfProperty">
              Kind of property
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              name="kindOfProperty"
              id="kindOfProperty">
              <option value="">Main property </option>
              <option value="">Second property</option>
              <option value="">Third property</option>
            </select>
          </div>

          <div className="flex flex-col text-center justify-center h-full w-1/3 border-r border-[#172544]">
            <label className="font-bold" htmlFor="bathrooms">
              Bathrooms
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              name="bathrooms"
              id="bathrooms">
              <option value="">1</option>
              <option value="">2</option>
              <option value="">3</option>
              <option value="">4+</option>
            </select>
          </div>

          <div className="flex flex-col text-center justify-center h-full w-1/3 ">
            <label className="font-bold" htmlFor="area">
              Area
            </label>
            <select
              className="w-fit m-auto bg-transparent outline-none p-2 my-2 rounded-lg border-[#172544] border"
              name="area"
              id="area">
              <option value="">60 - 100 m2</option>
              <option value="">100 - 150 m2</option>
              <option value="">150 - 200 m2</option>
              <option value="">200 - 250 m2</option>
              <option value="">250 - 300 m2</option>
              <option value="">300 - 350 m2</option>
              <option value="">350 - 400 m2</option>
              <option value="">400 - 450 m2</option>
              <option value="">450 - 500 m2</option>
              <option value="">500 - 550 m2</option>
              <option value="">550 - 600 m2</option>
            </select>
          </div>
        </div>
        <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl  font-serif">Where is it?</h2>
        </div>

        <input className="w-full rounded-xl p-2 outline-none" type="text" />

        <div className={`w-full h-[30vh] my-4 rounded-xl`}>
          <GoogleMapComponent city="Colombia" />
        </div>

        <div className="flex my-4  border-y border-[#172544] py-4 justify-between">
          <h2 className="text-xl  font-serif">Amenities and advantages</h2>
        </div>

        <div className="flex pb-8">
          <div className="w-1/5 gap-2 flex flex-col">
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="bike"
                id="bike"
              />
              <label className="" htmlFor="bike">
                Bike
              </label>
            </div>
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="car"
                id="car"
              />
              <label className="" htmlFor="car">
                Car
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="tv"
                id="tv"
              />
              <label className="" htmlFor="tv">
                TV
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="dishwasher"
                id="dishwasher"
              />
              <label className="" htmlFor="dishwasher">
                Dishwasher
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="pingpong"
                id="pingpong"
              />
              <label className="" htmlFor="pinpong">
                Ping pong
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="billiards"
                id="billiards"
              />
              <label className="" htmlFor="billiards">
                Billiards
              </label>
            </div>
          </div>

          <div className="w-1/5 gap-2 flex flex-col">
            <div className="gap-2 flex">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="washer"
                id="washer"
              />
              <label className="" htmlFor="washer">
                Washer
              </label>
            </div>
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="dryer"
                id="dryer"
              />
              <label className="" htmlFor="dryer">
                Dryer
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="wifi"
                id="wifi"
              />
              <label className="" htmlFor="wifi">
                Wifi
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="elevator"
                id="elevator"
              />
              <label className="" htmlFor="elevator">
                Elevator
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="terrace"
                id="terrace"
              />
              <label className="" htmlFor="terrace">
                Terrace
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="scooter"
                id="scooter"
              />
              <label className="" htmlFor="scooter">
                Scooter
              </label>
            </div>
          </div>

          <div className="w-1/5 gap-2 flex flex-col">
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="bbq"
                id="bbq"
              />
              <label className="" htmlFor="bbq">
                BBQ
              </label>
            </div>
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="computer"
                id="computer"
              />
              <label className="" htmlFor="computer">
                Home Computer
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="wc"
                id="wc"
              />
              <label className="" htmlFor="wc">
                WC Access
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="pool"
                id="pool"
              />
              <label className="" htmlFor="pool">
                Pool
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="playground"
                id="playground"
              />
              <label className="" htmlFor="playground">
                Playground
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="babyGear"
                id="babyGear"
              />
              <label className="" htmlFor="babyGear">
                Baby gear
              </label>
            </div>
          </div>

          <div className="w-1/5 gap-2 flex flex-col">
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="ac"
                id="ac"
              />
              <label className="" htmlFor="ac">
                AC
              </label>
            </div>
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="fireplace"
                id="fireplace"
              />
              <label className="" htmlFor="fireplace">
                Fireplace
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="parking"
                id="parking"
              />
              <label className="" htmlFor="parking">
                Private parking
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="hotTub"
                id="hotTub"
              />
              <label className="" htmlFor="hotTub">
                Hot tub
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="sauna"
                id="sauna"
              />
              <label className="" htmlFor="sauna">
                Sauna
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="other"
                id="other"
              />
              <label className="" htmlFor="other">
                Other...
              </label>
            </div>
          </div>

          <div className="w-1/5 gap-2 flex flex-col">
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="doorman"
                id="doorman"
              />
              <label className="" htmlFor="doorman">
                Doorman
              </label>
            </div>
            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="cleaningService"
                id="cleaningService"
              />
              <label className="" htmlFor="cleaningService">
                Cleaning service
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="videoGames"
                id="videoGames"
              />
              <label className="" htmlFor="videoGames">
                Video games
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="tennisCourt"
                id="tennisCourt"
              />
              <label className="" htmlFor="tennisCourt">
                Tennis court
              </label>
            </div>

            <div className="flex gap-2">
              <input
                className="bg-transparent appearance-none border border-[#172544] rounded-xl p-[6px] my-auto"
                type="radio"
                name="gym"
                id="gym"
              />
              <label className="" htmlFor="gym">
                Gym
              </label>
            </div>
          </div>
        </div>

        <button className="uppercase mb-8 mx-auto rounded-lg w-fit text-white text-lg px-4 font-extralight bg-[#F87C1B] py-2">
          Save Changes
        </button>
      </div>
    </main>
  );
};

export default Page;
