// Import the necessary hooks from React
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

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
  stripe: null,
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
  stripe: any;
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
  const [state, setState] = useState<StateType>(initialState);

  useEffect(() => {
    const isLocalStorageAvailable =
      typeof localStorage !== 'undefined' && typeof window !== 'undefined';

    if (isLocalStorageAvailable) {
      type localStorageStateType = {
        session?: any;
        user?: any;
        showMobileMenu?: boolean;
        noUser?: boolean;
        imgUploadPopUp?: boolean;
        aboutYou?: boolean;
        isSubscribed?: boolean;
        loggedInUser?: any;
        stripe?: any;
        activeNavButtons?: boolean;
      };

      let localStorageState: localStorageStateType = {};
      let isStateUpdated = false;

      Object.keys(initialState).forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
          const parsedItem = JSON.parse(item);
          if (state[key as keyof StateType] !== parsedItem) {
            Object.keys(initialState).forEach((key) => {
              const item = localStorage.getItem(key);
              if (item) {
                const parsedItem = JSON.parse(item);
                localStorageState[key as keyof localStorageStateType] =
                  parsedItem;
              }
            });
            isStateUpdated = true;
          }
        }
      });

      if (isStateUpdated) {
        setState((prevState) => ({ ...prevState, ...localStorageState }));
      }
    }
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
