'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { use, useEffect } from 'react';
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
import { usePathname, useRouter } from 'next/navigation';

import Stripe from 'stripe';

type Props = {};

const Navigation = (props: Props) => {
  const [mobileActive, setMobileActive] = React.useState(false);
  const [signInActive, setSignInActive] = React.useState(false);
  const { state, setState } = useStateContext();
  const [activeNavButtons, setActiveNavButtons] = React.useState(false);
  const supabase = supabaseClient();
  const [stripe, setStripe] = React.useState<Stripe | null>(null);
  const navigation = usePathname();
  const router = useRouter();

  const fetchStripe = async () => {
    // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
      apiVersion: '2023-08-16',
    });
    setStripe(stripe as Stripe | null); // Use type assertion

    if (stripe && state.user) {
      const isSubscribed = await isUserSubscribed(state.user.email);

      if (isSubscribed) {
        console.log('isSubscribed', isSubscribed);
        setActiveNavButtons(true);

        setState({ ...state, isSubscribed: true });
      } else {
        console.log('not subbed', isSubscribed);
        setState({ ...state, isSubscribed: false });
      }
    }
  };

  async function isUserSubscribed(email: string): Promise<boolean> {
    console.log('email', email);
    try {
      if (!stripe) {
        console.log('Stripe.js has not loaded yet.');
        return false;
      }
      // Retrieve the customer by email
      const customers = await stripe.customers.list({ email: email });
      const customer = customers.data[0]; // Assuming the first customer is the desired one

      if (customer) {
        // Retrieve the customer's subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 1, // Assuming only checking the latest subscription
        });

        console.log('subscriptions', subscriptions);

        return subscriptions.data.length > 0; // User is subscribed if there's at least one subscription
      } else {
        // Customer not found
        console.log('Customer not found');
        return false;
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      throw error;
    }
  }

  const fetchLoggedInUser = async () => {
    if (state.user) {
      const loggedInUserData = await supabase
        .from('listings')
        .select('userInfo')
        .eq('user_id', state.user.id);

      if (loggedInUserData?.data?.length === 0) {
        console.log('no user data');
        return;
      } else {
        if (loggedInUserData?.data) {
          console.log('logged in user', loggedInUserData?.data[0]?.userInfo);

          setState({
            ...state,
            loggedInUser: loggedInUserData?.data[0]?.userInfo,
          });
        }
      }
    }
  };

  useEffect(() => {
    if (state.session && state.user) {
      console.log('session', state.session);
      console.log('user', state.user);

      if (!state.loggedInUser) {
        console.log('fetching logged in user');
        fetchLoggedInUser();
      }
    }
  }, []);

  useEffect(() => {
    console.log('state', state);
  }, [state]);

  useEffect(() => {
    if (state.session && state.user) {
      isUserSubscribed(state.user.email);
      console.log('stripe', stripe);

      if (stripe !== null) {
        fetchStripe();
      }
    } else {
      setActiveNavButtons(false);
    }
  }, [state.session, navigation, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      // clear all state
      setState({
        ...state,
        session: null,
        user: null,
        showMobileMenu: false,
        noUser: false,
        imgUploadPopUp: false,
        aboutYou: false,
        isSubscribed: false,
        loggedInUser: null,
      });
      router.push('/home');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className=" relative  md:px-12 px-4  py-6 bg-[#fff] flex justify-between">
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
      <div className="hidden 2xl:flex gap-4 align-middle">
        {activeNavButtons && state.isSubscribed && (
          <>
            <Link className="m-auto text-sm" href="/how-it-works">
              HOW IT WORKS
            </Link>
            <Link className="m-auto text-sm" href="/messages">
              MESSAGES
            </Link>
            <Link className="m-auto text-sm" href="/profile">
              PROFILE
            </Link>
            <Link className="m-auto text-sm" href="/membership">
              MEMBERSHIP
            </Link>
            <Link className="m-auto text-sm" href="/listings">
              LISTINGS
            </Link>
            <Link className="m-auto text-sm" href="/listings/my-listing">
              MY LISTING
            </Link>
            {state.user?.email ===
              ('s.cuevas14@gmail.com' || 'anamariagomezc@gmail.com') && (
              <Link className="m-auto text-sm" href="/listings/admin-dashboard">
                APPROVAL DASHBOARD
              </Link>
            )}
          </>
        )}
        <Link className="text-sm" href="/about-us">
          US
        </Link>
        <Link className="text-sm" href="/become-member">
          BECOME A MEMEBER
        </Link>

        {activeNavButtons ? (
          <button
            className="m-auto text-sm"
            onClick={() => {
              handleSignOut();
            }}>
            SIGN OUT
          </button>
        ) : (
          <button
            className="m-auto text-sm"
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
            <Button className="bg-[#fff] shadow-none m-0 p-0">
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

      <div className="2xl:hidden">
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
        className={`2xl:hidden z-[20000] align-middle gap-4  box-border top-full flex flex-col justify-center text-center transition-all duration-300 ease-in-out overflow-hidden max-h-[100vh] left-0 bg-white w-full absolute`}>
        {activeNavButtons && state.isSubscribed && (
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
