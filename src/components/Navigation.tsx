'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect } from 'react';
import {
  Menu,
  MenuHandler,
  Button,
  MenuList,
  MenuItem,
  Input,
} from '@material-tailwind/react';
import SignIn from '@/components/SignIn';
import { useStateContext } from '@/context/StateContext';
import { supabaseClient } from '@/utils/supabaseClient';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {};

const Navigation = (props: Props) => {
  const [mobileActive, setMobileActive] = React.useState(false);
  const [signInActive, setSignInActive] = React.useState(false);
  const { state, setState } = useStateContext();
  const [activeNavButtons, setActiveNavButtons] = React.useState(false);
  const supabase = supabaseClient();

  useEffect(() => {
    const session = localStorage.getItem('session');
    const user = localStorage.getItem('user');
    if (session && user) {
      setState({
        ...state,
        session: JSON.parse(session),
        user: JSON.parse(user),
      });
    }
  }, []);

  useEffect(() => {
    if (state.session) {
      setActiveNavButtons(true);
    } else {
      setActiveNavButtons(false);
    }
  }, [state.session]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      setState({ ...state, session: null, user: null });
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className=" relative  md:px-12 px-4  py-4 bg-[#fff] flex justify-between">
      <div className="flex w-[150px] h-auto relative   items-center">
        <Link href="/home">
          <Image
            className="object-contain"
            src="/swom-logo.jpg"
            alt="logo"
            fill
          />
        </Link>
      </div>
      <div className="hidden xl:flex gap-8 align-middle">
        {activeNavButtons && (
          <>
            <Link className="m-auto" href="/how-it-works">
              HOW IT WORKS
            </Link>
            <Link className="m-auto" href="/messages">
              MESSAGES
            </Link>
            <Link className="m-auto" href="/profile">
              PROFILE
            </Link>
            <Link className="m-auto" href="/membership">
              MEMBERSHIP
            </Link>
            <Link className="m-auto" href="/listings">
              LISTINGS
            </Link>
            <Link className="m-auto" href="/listings/my-listing">
              MY LISTING
            </Link>
            {state.user?.email ===
              ('s.cuevas14@gmail.com' || 'anamariagomezc@gmail.com') && (
              <Link className="m-auto" href="/listings/admin-dashboard">
                APPROVAL DASHBOARD
              </Link>
            )}
          </>
        )}
        <Link href="/about-us">US</Link>
        <Link href="/become-member">BECOME A MEMEBER</Link>

        {activeNavButtons ? (
          <button
            className="m-auto"
            onClick={() => {
              handleSignOut();
            }}>
            SIGN OUT
          </button>
        ) : (
          <button
            className="m-auto"
            onClick={() => {
              setSignInActive(!signInActive);
            }}>
            SIGN IN
          </button>
        )}

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

        <Menu>
          <MenuHandler>
            <Button className="bg-[#fff] shadow-none">
              <Image
                alt="search"
                width={20}
                height={20}
                src="/search-icon.svg"></Image>
            </Button>
          </MenuHandler>
          <MenuList>
            <Input
              crossOrigin=""
              type="text"
              label="Search"
              containerProps={{
                className: 'mb-4',
              }}
            />
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
      </div>

      {signInActive && <SignIn setSignInActive={setSignInActive} />}

      <div className="xl:hidden">
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
          padding: mobileActive ? '20px 0' : '0',
        }}
        className={`xl:hidden z-[20000] align-middle gap-4  box-border top-full flex flex-col justify-center text-center transition-all duration-300 ease-in-out overflow-hidden max-h-[100vh] left-0 bg-white w-full absolute`}>
        {activeNavButtons && (
          <>
            <Link className="m-auto" href="/how-it-works">
              HOW IT WORKS
            </Link>
            <Link className="m-auto" href="/messages">
              MESSAGES
            </Link>
            <Link className="m-auto" href="/profile">
              PROFILE
            </Link>
            <Link className="m-auto" href="/membership">
              MEMBERSHIP
            </Link>
            <Link className="m-auto" href="/listings">
              LISTINGS
            </Link>
            <Link className="m-auto" href="/listings/my-listing">
              MY LISTING
            </Link>
            {state.user?.email ===
              ('s.cuevas14@gmail.com' || 'anamariagomezc@gmail.com') && (
              <Link className="m-auto" href="/listings/admin-dashboard">
                APPROVAL DASHBOARD
              </Link>
            )}
          </>
        )}
        <Link className="m-auto" href="/about-us">
          US
        </Link>
        <Link className="m-auto" href="/become-member">
          BECOME A MEMEBER
        </Link>
        {activeNavButtons ? (
          <button
            className="m-auto"
            onClick={() => {
              handleSignOut();
            }}>
            SIGN OUT
          </button>
        ) : (
          <button
            className="m-auto"
            onClick={() => {
              setSignInActive(!signInActive);
            }}>
            SIGN IN
          </button>
        )}

        <Menu>
          <MenuHandler>
            <Button className="bg-[#fff] mx-auto shadow-none">
              <Image
                alt="search"
                width={20}
                height={20}
                src="/search-icon.svg"></Image>
            </Button>
          </MenuHandler>
          <MenuList>
            <Input
              crossOrigin=""
              type="text"
              label="Search"
              containerProps={{
                className: 'mb-4',
              }}
            />
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
      </div>
    </nav>
  );
};

export default Navigation;
