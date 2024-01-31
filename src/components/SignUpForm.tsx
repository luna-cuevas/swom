'use client';
import React, { use, useEffect, useState } from 'react';
import { set, useController, useForm } from 'react-hook-form';
import { supabaseClient } from '@/utils/supabaseClient';
import { CheckoutSubscriptionBody } from '@/app/api/subscription/makeSubscription/route';
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { useStateContext } from '@/context/StateContext';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter, useSearchParams } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';

type Props = {};

const SignUpForm = (props: Props) => {
  const supabase = supabaseClient();
  const [selectedPlan, setSelectedPlan] = useState({
    plan: '1 year',
    interval: 'year',
    amount: 20000,
    planDescription: 'Subscribe for $200 per year.',
  });
  const { state, setState } = useStateContext();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [subScreen, setSubScreen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

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
    if (state.user?.email) {
      setValue('email', state.user?.email);
    }
  }, [state.user]);

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

  useEffect(() => {
    // check if  search params has session_id
    if (sessionId) {
      console.log('subscription result', sessionId);
      setState({ ...state, isSubscribed: true, activeNavButtons: true });
      toast.success('Subscribed successfully');
      // navigate to the listings/my-listing page
      router.push('/home');
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

  const stripeActivation = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    {
      apiVersion: '2023-08-16',
    }
  );

  const fetchStripe = async (email: string) => {
    console.log('fetching stripe');

    const isSubscribed = await isUserSubscribed(email, stripeActivation);

    return isSubscribed;
  };

  async function isUserSubscribed(
    email: string,
    stripe: any
  ): Promise<boolean> {
    console.log('checking subscription status');
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
        session,
        user: session.user,
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
