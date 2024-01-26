// Import the necessary hooks from React
import { supabaseClient } from '@/utils/supabaseClient';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import Stripe from 'stripe';

// Define your initial state
const initialState: StateType = {
  session: null,
  user: null,
  showMobileMenu: false,
  noUser: false,
  imgUploadPopUp: false,
  aboutYou: false,
  isSubscribed: false,
  loggedInUser: null,
  activeNavButtons: false,
};

// Define the types
type StateType = {
  session: any;
  user: any;
  showMobileMenu: boolean;
  noUser: boolean;
  imgUploadPopUp: boolean;
  aboutYou: boolean;
  isSubscribed: boolean;
  loggedInUser: any;
  activeNavButtons: boolean;
};

type StateContextType = {
  state: StateType;
  setState: React.Dispatch<React.SetStateAction<StateType>>;
};

type StateProviderProps = {
  children: ReactNode;
};

const StateContext = createContext<StateContextType | undefined>(undefined);

const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const [state, setState] = useState<StateType>({
    ...initialState,
  });

  const supabase = supabaseClient();
  const stripeActivation = new Stripe(
    process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!,
    {
      apiVersion: '2023-08-16',
    }
  );

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

  useEffect(() => {
    const handleAuthChange = async (event: any, session: any) => {
      console.log('event', event);
      console.log('session', session);
      if (event === 'SIGNED_IN' || (event == 'INITIAL_SESSION' && session)) {
        console.log('sessting session', session);
        const loggedInUser = await fetchLoggedInUser(session.user);
        const subbed = await isUserSubscribed(
          session.user.email,
          stripeActivation
        );
        setState({
          ...state,
          session,
          user: session.user,
          loggedInUser: loggedInUser,
          isSubscribed: subbed,
          activeNavButtons: true,
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('session', event);
        console.log('SignIn Failed');
      }
    };

    // Subscribe to authentication changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleAuthChange(event, session);
      }
    );

    // // Cleanup subscription on unmount
    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
  }, []);

  useEffect(() => {
    const isLocalStorageAvailable =
      typeof localStorage !== 'undefined' && typeof window !== 'undefined';

    if (isLocalStorageAvailable) {
      Object.entries(state).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    }
  }, [state]);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};

const useStateContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};

export { StateProvider, useStateContext };
