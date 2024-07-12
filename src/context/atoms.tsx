import { atom } from "jotai";

type State = {
  session: null | string;
  user: { email: string };
  showMobileMenu: boolean;
  noUser: boolean;
  imgUploadPopUp: boolean;
  isSubscribed: boolean;
  loggedInUser: null | string;
  activeNavButtons: boolean;
  unreadCount: number;
  allListings: {
    listings: any[];
    lastFetched: number;
  };
};

const getUnreadMessagesCount = async (userId: string) => {
  const response = await fetch('/api/getUnread', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: userId }),
  });

  if (!response.ok) {
    throw new Error(`Error fetching unread messages count: ${response.statusText}`);
  }

  const data = await response.json();
  // console.log("the data you requested", data);
  return data.unreadCount;
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
  user: { email: "" },
  showMobileMenu: false,
  noUser: false,
  imgUploadPopUp: false,
  isSubscribed: false,
  loggedInUser: null,
  activeNavButtons: false,
  unreadCount: 0,
  allListings: {
    listings: [],
    lastFetched: 0,
  },
};

// Create an atom with local storage persistence for the entire application state
export const globalStateAtom = atomWithLocalStorage(
  "SWOMGlobalState",
  initialState
);
