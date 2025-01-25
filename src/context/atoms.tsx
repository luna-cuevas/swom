import { atom } from "jotai";

type User = {
  email: string;
  id: string;
  name: string;
  role: string;
  profileImage: string;
  favorites: any[];
  privacyPolicy: string;
  privacyPolicyDate: string;
  subscribed: boolean;
  subscription_id: string;
  stripe_customer_id: string;
};

type State = {
  session: null | string;
  user: User;
  showMobileMenu: boolean;
  noUser: boolean;
  imgUploadPopUp: boolean;
  isSubscribed: boolean;
  loggedInUser: null | string;
  activeNavButtons: boolean;
  unreadCount: number;
  unreadConversations: any[];
  signInActive: boolean;
  allListings: {
    listings: any[];
    lastFetched: number;
  };
};

// A helper function to work with localStorage and JSON serialization for the entire application state
const atomWithLocalStorage = (key: string, initialValue: any) => {
  const getInitialValue = () => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key);
      if (item !== null) {
        try {
          return JSON.parse(item);
        } catch {
          console.error("Could not parse the stored value in localStorage.");
        }
      }
    }
    return initialValue;
  };

  const baseAtom = atom(getInitialValue());
  const derivedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: ((prevState: State) => State) | State) => {
      const nextValue =
        typeof update === "function" ? update(get(baseAtom)) : update;
      set(baseAtom, nextValue);
      localStorage.setItem(key, JSON.stringify(nextValue));
    }
  );

  return derivedAtom;
};

// Define your initial state
const initialState: State = {
  session: null,
  user: {
    email: "",
    id: "",
    name: "",
    role: "",
    profileImage: "",
    favorites: [],
    privacyPolicy: "",
    privacyPolicyDate: "",
    subscribed: false,
    subscription_id: "",
    stripe_customer_id: "",
  },
  showMobileMenu: false,
  noUser: false,
  imgUploadPopUp: false,
  isSubscribed: false,
  loggedInUser: null,
  activeNavButtons: false,
  unreadCount: 0,
  unreadConversations: [],
  signInActive: false,
  allListings: {
    listings: [],
    lastFetched: 0,
  },
};

// Create an atom with local storage persistence for the entire application state
export const globalStateAtom = atomWithLocalStorage(
  "SWOMGlobalState-v3",
  initialState
);
