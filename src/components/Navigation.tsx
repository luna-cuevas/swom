'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {};

const Navigation = (props: Props) => {
  const [mobileActive, setMobileActive] = React.useState(false);

  return (
    <nav className=" relative  px-12  py-4 bg-[#F4ECE8] flex justify-between">
      <div className="flex w-[150px] h-auto relative  justify-center items-center">
        <Image src="/swom-logo.jpg" alt="logo" fill objectFit="contain" />
      </div>
      <div className="hidden md:flex gap-8 align-middle">
        <Link className="m-auto" href="/membership">
          MEMBERSHIP
        </Link>
        <Link className="m-auto" href="/listings">
          LISTINGS
        </Link>
        <button>US</button>
        <Link href="/">BECOME A MEMEBER</Link>
        <Link href="/">SIGN IN</Link>
        <button>
          <Image
            alt="search"
            width={20}
            height={20}
            src="/search-icon.svg"></Image>
        </button>
      </div>

      <div className="md:hidden">
        <button onClick={() => setMobileActive(!mobileActive)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M1.66667 3.33333H18.3333V5.83333H1.66667V3.33333ZM1.66667 8.33333H18.3333V10.8333H1.66667V8.33333ZM1.66667 13.3333H18.3333V15.8333H1.66667V13.3333Z"
              fill="#000000"
            />
          </svg>
        </button>
      </div>

      <div
        style={{
          maxHeight: mobileActive ? '100vh' : '0',
          borderTop: mobileActive ? '1px solid #a9a9a9' : 'none',
          padding: mobileActive ? '5px 0' : '0',
        }}
        className={`md:hidden z-20 align-middle gap-4 box-border top-full flex flex-col justify-center text-center transition-all duration-300 ease-in-out overflow-hidden max-h-[100vh] left-0 bg-[#F4ECE8] w-full absolute`}>
        <button>US</button>
        <Link className="m-auto" href="/">
          LISTINGS
        </Link>
        <Link className="m-auto" href="/">
          BECOME A MEMEBER
        </Link>
        <Link className="m-auto" href="/">
          SIGN IN
        </Link>
        <button className="m-auto">
          <Image
            alt="search"
            width={20}
            height={20}
            src="/search-icon.svg"></Image>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
