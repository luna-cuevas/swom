'use client';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
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

const Page = (props: Props) => {
  const { state, setState } = useStateContext();

  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const supabase = supabaseClient();

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

  const onSubmit = (e: any) => {
    e.preventDefault();
    const passwordResults = comparePasswords();
    if (passwordResults && newPassword !== '') {
      setIsPasswordChanged(false);
      const updatePassword = async () => {
        const { data, error } = await supabase.auth.updateUser({
          password: 'new password',
        });
        if (error) {
          toast.error('Password not updated');
        } else {
          toast.success('Password updated');
        }
      };
      updatePassword();
    }
    const updateDetails = async () => {
      const { data, error } = await supabase.auth.updateUser({
        email: emailAddress,
        data: {
          name: `${firstName} ${lastName}`,
          username: userName,
          profilePic: '/profile/profile-pic-placeholder.png',
        },
      });
      if (error) {
        toast.error('Details not updated');
        console.log('error', error);
      } else {
        console.log('data', data);
        toast.success('Details updated');
      }
    };
    updateDetails();
  };

  useEffect(() => {
    setFirstName(state?.user?.user_metadata?.name.split(' ')[0]);
    setLastName(state?.user?.user_metadata?.name.split(' ')[1]);
    setEmailAddress(state?.user?.email);
    setUserName(state?.user?.email.split('@')[0]);
  }, [
    state?.user?.user_metadata?.name,
    state?.user?.email,
    state?.user?.user_metadata?.username,
  ]);

  return (
    <main className="bg-[#F7F1EE] min-h-[80vh] relative flex flex-col">
      <h1 className="py-4 px-12 bg-[#172544] text-white font-sans tracking-[0.3rem] uppercase">
        My Profile
      </h1>
      <div className="w-full relative max-w-[1000px] my-auto py-12 md:px-16 px-4">
        <form
          onSubmit={onSubmit}
          className="flex md:flex-row flex-col px-4 relative  z-20 justify-evenly">
          <div className="flex justify-center  flex-col md:w-1/3">
            <div className="relative mx-auto h-20 w-20 rounded-full">
              <Image
                src="/profile/profile-pic-placeholder.png"
                alt="hero"
                fill
              />
            </div>
            <h4 className="font-bold mx-auto my-4 tracking-widest uppercase">
              {state?.user?.user_metadata?.name}
            </h4>
            <button
              type="button"
              className="bg-[#172544] py-2 px-4 mx-auto w-fit text-white rounded-3xl">
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
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                  }}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
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
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
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
                value={emailAddress}
                onChange={(e) => {
                  setEmailAddress(e.target.value);
                }}
                className=" border-b-[1px] focus-visible:outline-none bg-transparent border-[#172544]"
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
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                  }}
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
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
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
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
                  className="w-full focus-visible:outline-none bg-transparent border-b-[1px] border-[#172544]"
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

export default Page;
