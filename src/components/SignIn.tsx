'use client';
import React, { useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { supabaseClient } from '@/utils/supabaseClient';
import { useStateContext } from '@/context/StateContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
  setSignInActive: React.Dispatch<React.SetStateAction<boolean>>;
};

const SignIn = (props: Props) => {
  const supabase = supabaseClient();
  const [loading, setLoading] = React.useState(true);
  const { state, setState } = useStateContext();

  useEffect(() => {
    const { data: authListener } =
      supabase.auth.onAuthStateChange(handleAuthChange);
    // Simulate a delay for the loading animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleAuthChange = async (event: any, session: any) => {
    if (event === 'SIGNED_IN' && session !== null) {
      console.log('session', event);
      localStorage.setItem('session', JSON.stringify(session));
      localStorage.setItem('user', JSON.stringify(session.user));
      setState({
        ...state,
        session,
        user: session.user,
      });
      console.log('session', session);
      toast.success('Signed in successfully');

      props.setSignInActive(false);
    } else {
    }
  };
  return (
    <div
      className={`fixed w-full h-full top-0 bottom-0 left-0 right-0     flex m-auto z-[200000000] `}>
      <div
        className="fixed w-full h-full bg-gray-600 opacity-50 top-0 bottom-0 left-0 right-0 z-[20000000]"
        onClick={() => {
          props.setSignInActive(false);
        }}
      />
      <div className="z-[20000001] rounded-2xl fixed w-2/3 bottom-0 m-auto top-0 flex left-0 right-0 h-fit py-8 bg-[#F7F1EE] border-[6px] border-[#7F8019]">
        <div className="flex w-[40%] ">
          <h2 className="uppercase font-sans leading-[60px] p-10 text-right tracking-[0.3rem] m-auto text-4xl">
            Members Login
          </h2>
        </div>
        <div className="flex w-[60%] ">
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
          <div className="m-auto w-full">
            <Auth
              supabaseClient={supabase}
              appearance={{
                style: {
                  button: {
                    width: 'fit-content',
                    maxWidth: '100%',
                    textTransform: 'uppercase',
                    background: '#EB8828',
                    color: 'white',
                    padding: '0.5rem 2rem',
                    borderRadius: '0.375rem',
                    fontFamily: 'sans-serif',
                  },
                  input: {
                    letterSpacing: '0.25rem',
                    textTransform: 'uppercase',
                    color: '#F7F1EE',
                    background: '#7F8019',
                    borderRadius: '0.375rem',
                    padding: '1rem 0.75rem',
                  },
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: '',
                    password_label: '',
                    email_input_placeholder: 'Email address',
                    password_input_placeholder: 'Password',
                    button_label: 'Sign in',
                  },
                  sign_up: {
                    link_text: '',
                  },
                },
              }}
              providers={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
