import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {};

const Footer = (props: Props) => {
  const handleSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const language = e.currentTarget.language.value;

    console.log('Email:', email);
    console.log('Language:', language);

    alert('Message sent!');
  };

  return (
    <div className="md:h-[250px] h-[400px] bg-[#7F8119] md:flex-row flex-col flex justify-center align-middle w-full">
      <div className="md:w-1/2 flex align-middle justify-center gap-4 my-auto  h-1/2">
        <div
          style={{
            filter:
              'invert(98%) sepia(3%) saturate(2%) hue-rotate(304deg) brightness(105%) contrast(100%)',
          }}
          className="relative flex my-auto h-1/2 w-1/3 ">
          <Image src="/footer-logo.jpg" alt="logo" fill objectFit="contain" />
        </div>
        <div className=" my-auto border-l-2 px-4 border-white">
          <ul className="text-[#F4ECE8] gap-1 flex flex-col font-extralight">
            <Link href="/">What is Swom</Link>
            <Link href="/">Become a member</Link>
            <Link href="/">How it works</Link>
            <Link href="/">About us</Link>
          </ul>
          <div>{/* media icons */}</div>
        </div>
      </div>

      <div className="md:w-1/3 w-3/4  m-auto flex flex-col">
        <form
          onSubmit={(e) => {
            handleSubmission(e);
          }}>
          <p className="text-[#F4ECE8]">Contact us</p>
          <input
            name="email"
            placeholder="Email"
            className="w-full p-4  rounded-lg my-2 bg-[#F4ECE8]"
            type="text"
          />
          <select
            name="language"
            className="w-fit p-4 rounded-lg my-1 bg-[#F4ECE8]"
            id="">
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
          </select>
          <button className="bg-[#F4ECE8] ml-4 w-fit  p-4 rounded-lg my-1">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Footer;
