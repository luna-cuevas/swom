'use client';
import React, { use, useEffect, useState } from 'react';
import { set, useController, useForm } from 'react-hook-form';
import { supabaseClient } from '@/utils/supabaseClient';
import { CheckoutSubscriptionBody } from '@/app/api/subscription/makeSubscription/route';
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';
import { useAtom } from 'jotai';
import { globalStateAtom } from '@/context/atoms';
import { sanityClient } from '../../sanity/lib/client';

type Props = {};

const SignUpForm = (props: Props) => {
  const supabase = supabaseClient();
  const [state, setState] = useAtom(globalStateAtom);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [subScreen, setSubScreen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  console.log('session id', sessionId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({});

  useEffect(() => {
    const fetchStripe = async () => {
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!
      );
      setStripe(stripe as Stripe | null); // Use type assertion
    };
    fetchStripe();
  }, []);

  useEffect(() => {
    const { data: userData } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(event, session);
        console.log('event', event, 'user session', session);

        if (event === 'PASSWORD_RECOVERY' && session != null) {
          setState({
            ...state,
            session,
            user: session.user,
            // isSubscribed: subbed,
            // activeNavButtons: true,
          });
          setValue('email', session?.user?.email);
          // handle initial session
        }
      }
    );
  }, []);

  const onSubmit = (data: any) => {
    const fullName = data.firstName + ' ' + data.lastName;
    if (!subScreen) {
      handleSignUp(fullName, data.email, data.password).then((result) => {
        setSubScreen(result);
      });
    } else {
      handleSubscription();
    }
  };

  // update sanity subscription field for this user to true
  const updateSubscription = async (email: string) => {
    const query = `*[_type == "listing" && userInfo.email == $email][0]`;
    const params = { email: state.loggedInUser.email };
    const document = await sanityClient.fetch(query, params);
    const documentId = document._id;

    console.log('document', document);

    const updatedDocument = sanityClient
      .patch(documentId)
      .set({
        ...document,
        subscribed: true,
      })
      .commit();
    console.log('updated document', updatedDocument);
  };

  useEffect(() => {
    if (sessionId) {
      console.log('subscription result', sessionId);
      setState({ ...state, isSubscribed: true, activeNavButtons: true });
      toast.success('Subscribed successfully');
      updateSubscription(state.loggedInUser.email);

      setTimeout(() => {
        router.push('/home');
      }, 2000);
    }
  }, [sessionId]);

  const onError = (errors: any, e: any) => {
    console.log(errors, e);
  };

  const handleSubscription = async () => {
    if (stripe) {
      const body: CheckoutSubscriptionBody = {
        interval: 'year',
        amount: 20000,
        plan: '1 year',
        planDescription: 'Subscribe for $200 per year.',
      };

      try {
        // Make a post fetch API call to /checkout-session handler
        const result = await fetch('/api/subscription/makeSubscription', {
          method: 'post',
          body: JSON.stringify(body),
          headers: {
            'content-type': 'application/json',
          },
        });

        if (!result.ok) {
          // Handle the case where subscription creation failed
          console.error('Failed to create subscription:', result.statusText);
          toast.error('Something went wrong');
          setSubScreen(true);
          return false;
        }

        const data = await result.json();
        const sessionId = data.id;

        // Redirect to Checkout page
        if (sessionId) {
          const { error } = await (stripe as any).redirectToCheckout({
            sessionId,
          });

          if (error) {
            console.error('Error redirecting to Checkout:', error);
            // Handle the error (e.g., show an error message to the user)
            return false;
          }

          // Subscription creation and redirection were successful
          return true;
        }
      } catch (error) {
        console.error('Error handling subscription:', error);
        // Handle unexpected errors
        return false;
      }
    }

    // Stripe is not initialized
    return false;
  };

  const fetchLoggedInUser = async (user: any) => {
    console.log('fetching logged in user', user);

    try {
      // Make a GET request to the API route with the user ID as a query parameter
      const response = await fetch(`/api/getUser`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ id: user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();

      if (data) {
        return data;
      } else {
        console.log('No data found for the user');
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching user data:', error.message);
      return null;
    }
  };

  const handleSignUp = async (
    name: string,
    email: string,
    password: string
  ) => {
    const { data: session, error } = await supabase.auth.updateUser({
      password: password,
    });

    console.log('session', session);

    if (error) {
      toast.error(error.message);
      return false;
    } else {
      const loggedInUser = await fetchLoggedInUser(session.user);
      setState({
        ...state,
        loggedInUser: loggedInUser,
      });

      toast.success('Signed up successfully');
      return true;
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="w-11/12  md:w-2/3 max-w-[800px] flex flex-col my-12 m-auto border-4 bg-gray-100 border-[#c9c9c9] rounded-xl p-12">
      {!subScreen ? (
        <div className="gap-8 mb-8 flex justify-between">
          <input
            type="email"
            disabled={state.user?.email ? true : false}
            className="border-2 w-full focus:outline-none p-2 text-lg rounded-lg"
            placeholder="Email"
            {...register('email', { required: true })}
          />
          <input
            type="password"
            className="border-2 w-full focus:outline-none p-2 text-lg rounded-lg"
            placeholder="Password"
            {...register('password', { required: true })}
          />
        </div>
      ) : (
        <div className="flex my-8 justify-evenly">
          <div
            className={`rounded-md  text-center p-8 flex flex-col gap-2 items-start`}>
            <h2 className="text-2xl font-bold text-gray-700">
              1 Year Subscription
            </h2>
            <p className="text-gray-800 text-center w-fit mx-auto text-lg">
              $200 per year
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        className="p-4 bg-[#172644] text-white rounded-xl hover:bg-[#284276] m-auto border-2 border-gray-200">
        {!subScreen ? 'Reset Password' : 'Sign Up'}
      </button>
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
    </form>
  );
};

export default SignUpForm;
