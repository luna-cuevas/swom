import Image from 'next/image';
import React from 'react';

type Props = {};

const page = (props: Props) => {
  return (
    <main className="bg-[#F4ECE8] min-h-[80vh] relative flex flex-col">
      <h1 className="py-4 px-12 bg-[#172544] text-white tracking-[0.3rem] uppercase">
        My Profile
      </h1>
      <div className="w-full relative max-w-[1000px] my-auto py-12 md:px-16 px-4">
        <form className="flex md:flex-row flex-col px-4 relative bg-[#F4ECE8] z-20 justify-evenly">
          <div className="flex justify-center  flex-col md:w-1/3">
            <div className="relative mx-auto h-20 w-20 rounded-full">
              <Image
                src="/profile/profile-pic-placeholder.png"
                alt="hero"
                fill
              />
            </div>
            <h4 className="font-bold mx-auto my-4 tracking-widest uppercase">
              First Last Name
            </h4>
            <button className="bg-[#172544] py-2 px-4 mx-auto w-fit text-white rounded-3xl">
              Upload a profile photo
            </button>
          </div>

          <div className="h-auto w-[2px] border-x-[1px] border-[#172544]" />
          <div className="md:w-1/2 flex flex-col  pl-6 gap-12 my-4">
            <h2 className="text-[#D68834] text-center md:text-left tracking-[0.3rem] uppercase font-bold">
              Profile Settings
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div>
                <label className="tracking-widest uppercase text-sm" htmlFor="">
                  First Name
                </label>
                <input
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
              <div>
                <label className="tracking-widest uppercase text-sm" htmlFor="">
                  Last Name
                </label>
                <input
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="tracking-widest uppercase text-sm" htmlFor="">
                Email
              </label>
              <input
                className=" border-b-[1px] focus-visible:outline-none bg-[#F4ECE8] border-[#172544]"
                type="email"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="">
                <label className="tracking-widest uppercase text-sm" htmlFor="">
                  Username
                </label>
                <input
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
              <div className="">
                <label className="tracking-widest uppercase text-sm" htmlFor="">
                  Password
                </label>
                <input
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="password"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-fit mx-auto md:mx-0 bg-[#D68834] rounded-3xl px-8 py-2 text-white">
              Update Details
            </button>
          </div>
        </form>
      </div>
      <div className="  h-[45vh]  w-1/3 z-10 right-0 bottom-0 absolute">
        <Image
          src="/profile/profile-bg.png"
          alt="hero"
          fill
          objectFit="cover"
        />
      </div>
    </main>
  );
};

export default page;
