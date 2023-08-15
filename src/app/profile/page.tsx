'use client';
import Image from 'next/image';
import React, { ChangeEvent, use, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {};

const profileDummyData = {
  name: 'FirstName LastName',
  email: 'example@email.com',
  username: 'username',
  password: 'password',
  profileImage: '/profile/profile-pic-placeholder.png',
};

const page = (props: Props) => {
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [newPassword, setNewPassword] = useState<string[]>([
    profileDummyData.password,
  ]);
  const [confirmPassword, setConfirmPassword] = useState<string[]>([]);

  const handlePasswordChange = (password: any) => {
    // i want it to add all the characters to the array to form newPassword
    // then when the user clicks update details it will update the password in the database
    setNewPassword(password);
    setIsPasswordChanged(true);
  };

  const handleConfirmPasswordChange = (password: any) => {
    // i want it to add all the characters to the array to form newPassword
    // then when the user clicks update details it will update the password in the database
    setConfirmPassword(password);
  };

  const comparePasswords = () => {
    if (newPassword === confirmPassword) {
      console.log('passwords match');
      return true;
    } else {
      toast.error('Passwords do not match');
      return false;
    }
  };

  useEffect(() => {
    console.log(newPassword);
  }, [newPassword]);

  const onSubmit = (e: any) => {
    e.preventDefault();
    const passwordResults = comparePasswords();
    if (passwordResults) {
      setIsPasswordChanged(false);
      toast.success('Details updated');
    } else {
      toast.error('Details not updated');
      return;
    }
  };

  return (
    <main className="bg-[#F4ECE8] min-h-[80vh] relative flex flex-col">
      <h1 className="py-4 px-12 bg-[#172544] text-white font-sans tracking-[0.3rem] uppercase">
        My Profile
      </h1>
      <div className="w-full relative max-w-[1000px] my-auto py-12 md:px-16 px-4">
        <form
          onSubmit={onSubmit}
          className="flex md:flex-row flex-col px-4 relative bg-[#F4ECE8] z-20 justify-evenly">
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
            <h2 className="text-[#D68834] font-sans text-center md:text-left tracking-[0.3rem] uppercase font-bold">
              Profile Settings
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div>
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  First Name
                </label>
                <input
                  value={profileDummyData.name.split(' ')[0] || ''}
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
              <div>
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Last Name
                </label>
                <input
                  value={profileDummyData.name.split(' ')[1] || ''}
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label
                className="tracking-widest font-bold uppercase text-sm"
                htmlFor="">
                Email
              </label>
              <input
                value={profileDummyData.email || ''}
                className=" border-b-[1px] focus-visible:outline-none bg-[#F4ECE8] border-[#172544]"
                type="email"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="">
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Username
                </label>
                <input
                  value={profileDummyData.username || ''}
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="text"
                />
              </div>
              <div className="">
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Password
                </label>
                <input
                  onChange={(e) => {
                    handlePasswordChange(e.target.value);
                  }}
                  value={newPassword}
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="password"
                />
              </div>
            </div>
            {isPasswordChanged && (
              <div className="md:w-1/2 md:ml-auto md:pl-4">
                <label
                  className="tracking-widest font-bold uppercase text-sm"
                  htmlFor="">
                  Confirm Password
                </label>
                <input
                  onChange={(e) => {
                    handleConfirmPasswordChange(e.target.value);
                  }}
                  value={confirmPassword}
                  className="w-full focus-visible:outline-none bg-[#F4ECE8] border-b-[1px] border-[#172544]"
                  type="password"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-fit mx-auto md:mx-0 font-['Noto'] bg-[#D68834] rounded-3xl px-8 py-2 text-white">
              Update Details
            </button>
          </div>
        </form>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="  h-[45vh]  w-1/4 z-10 right-0 bottom-0 absolute">
        <Image
          src="/profile/profile-bg.png"
          alt="hero"
          fill
          objectFit="contain"
        />
      </div>
    </main>
  );
};

export default page;
