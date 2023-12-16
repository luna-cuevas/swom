'use client';
import React, { useEffect, useState } from 'react';
import { set, useController, useForm } from 'react-hook-form';
import { supabaseClient } from '@/utils/supabaseClient';
import { CheckoutSubscriptionBody } from '@/app/api/subscription/route';
import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';
import { useStateContext } from '@/context/StateContext';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';

type Props = {};

const SignUpForm = (props: Props) => {
  const supabase = supabaseClient();
  const [selectedPlan, setSelectedPlan] = useState({
    plan: 'Monthly',
    interval: 'month',
    amount: 20,
    planDescription: 'Subscribe for $20 per month',
  });
  const { state, setState } = useStateContext();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [subScreen, setSubScreen] = useState(false);
  const router = useRouter();

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
    if (state.user) {
      if (state.isSubscribed) {
        router.push('/home');
      }
    }
  }, [state.user, state.isSubscribed]);

  const onSubmit = (data: any) => {
    const fullName = data.firstName + ' ' + data.lastName;
    if (!subScreen) {
      handleSignUp(fullName, data.email, data.password).then((result) => {
        setSubScreen(result);
      });
    } else {
      handleSubscription().then((result) => {
        if (result) {
          setState({ ...state, isSubscribed: true });
          toast.success('Subscribed successfully');
          // navigate to the listings/my-listing page
        } else {
          toast.error('Something went wrong');
          setSubScreen(true);
        }
      });
    }
  };

  useEffect(() => {
    // check if  search params has session_id
  }, []);

  const onError = (errors: any, e: any) => {
    console.log(errors, e);
  };

  const handleSubscription = async () => {
    if (stripe) {
      const body: CheckoutSubscriptionBody = {
        interval: selectedPlan.interval as 'month' | 'year',
        amount: selectedPlan.amount,
        plan: selectedPlan.plan,
        planDescription: selectedPlan.planDescription,
      };

      try {
        // Make a post fetch API call to /checkout-session handler
        const result = await fetch('/api/subscription', {
          method: 'post',
          body: JSON.stringify(body),
          headers: {
            'content-type': 'application/json',
          },
        });

        if (!result.ok) {
          // Handle the case where subscription creation failed
          console.error('Failed to create subscription:', result.statusText);
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
      setState({
        ...state,
        user: session?.user,
        session: session,
        isSubscribed: false,
      });
      localStorage.setItem('user', JSON.stringify(session?.user));
      localStorage.setItem('session', JSON.stringify(session));
      toast.success('Signed up successfully');
      return true;
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="w-11/12 md:w-2/3 max-w-[800px] flex flex-col my-12 m-auto border-4 bg-gray-100 border-[#c9c9c9] rounded-xl p-12">
      {/* <div className="gap-8 mb-4 flex justify-between">
        <input
          type="text"
          className="border-2 w-1/2 focus:outline-none p-2 text-lg rounded-lg"
          placeholder="First Name"
          {...register('firstName', { required: true })}
        />
        <input
          type="text"
          className="border-2 w-1/2 focus:outline-none p-2 text-lg rounded-lg"
          placeholder="Last Name"
          {...register('lastName', { required: true })}
        />
      </div> */}

      {!subScreen ? (
        <div className="gap-8 mb-8 flex justify-between">
          <input
            type="email"
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
            className={`${
              selectedPlan.plan == 'Monthly'
                ? ' border-[#7E8019] shadow-xl bg-[#ffffff]'
                : 'border-gray-300'
            } border-4 rounded-md p-8 flex flex-col gap-2 items-start`}>
            <h2 className="text-xl font-bold text-gray-700">
              Monthly Subscription
            </h2>
            <p className="text-gray-400">$20 per month</p>
            <button
              type="button"
              onClick={() =>
                setSelectedPlan({
                  plan: 'Monthly',
                  interval: 'month',
                  amount: 20,
                  planDescription: 'Subscribe for $20 per month',
                })
              }
              className={`border ${
                selectedPlan.plan == 'Monthly' && 'bg-[#7E8019] text-white'
              } border-violet-200 text-violet-500 rounded-md px-4 py-2 w-full hover:bg-violet-500 hover:text-violet-200 transition-colors`}>
              Select
            </button>
          </div>

          <div
            className={`${
              selectedPlan.plan == 'Yearly'
                ? 'border-[#7E8019] shadow-xl bg-[#ffffff]'
                : 'border-gray-300'
            } border-4 rounded-md p-8 flex flex-col gap-2 items-start`}>
            <h2 className="text-xl font-bold text-gray-700">
              Yearly Subscription
            </h2>
            <p className="text-gray-400">$200 per year</p>
            <button
              type="button"
              onClick={() =>
                setSelectedPlan({
                  plan: 'Yearly',
                  interval: 'year',
                  amount: 200,
                  planDescription: 'Subscribe for $200 per year',
                })
              }
              className={`border ${
                selectedPlan.plan == 'Yearly' && 'bg-[#7E8019] text-white'
              } border-violet-200 text-violet-500 rounded-md px-4 py-2 w-full hover:bg-violet-500 hover:text-violet-200 transition-colors`}>
              Select
            </button>
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
