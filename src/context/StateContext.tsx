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
};

type StateContextType = {
  state: StateType;
  setState: React.Dispatch<React.SetStateAction<StateType>>;
};

type StateProviderProps = {
  children: ReactNode;
};

// Create the context
const StateContext = createContext<StateContextType | undefined>(undefined);

// Create the StateProvider component
const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  // Use individual local storage keys for each piece of state
  const localStorageKeys = {
    session: 'session',
    user: 'user',
    showMobileMenu: 'showMobileMenu',
    noUser: 'noUser',
    imgUploadPopUp: 'imgUploadPopUp',
    aboutYou: 'aboutYou',
    isSubscribed: 'isSubscribed',
    loggedInUser: 'loggedInUser',
  };

  // Retrieve each piece of state from local storage on component mount (or use initialState)
  const storedState: StateType = {
    session:
      JSON.parse(localStorage.getItem(localStorageKeys.session) || 'null') ||
      initialState.session,
    user:
      JSON.parse(localStorage.getItem(localStorageKeys.user) || 'null') ||
      initialState.user,
    showMobileMenu:
      JSON.parse(
        localStorage.getItem(localStorageKeys.showMobileMenu) || 'false'
      ) || initialState.showMobileMenu,
    noUser:
      JSON.parse(localStorage.getItem(localStorageKeys.noUser) || 'false') ||
      initialState.noUser,
    imgUploadPopUp:
      JSON.parse(
        localStorage.getItem(localStorageKeys.imgUploadPopUp) || 'false'
      ) || initialState.imgUploadPopUp,
    aboutYou:
      JSON.parse(localStorage.getItem(localStorageKeys.aboutYou) || 'false') ||
      initialState.aboutYou,
    isSubscribed:
      JSON.parse(
        localStorage.getItem(localStorageKeys.isSubscribed) || 'false'
      ) || initialState.isSubscribed,
    loggedInUser:
      JSON.parse(
        localStorage.getItem(localStorageKeys.loggedInUser) || 'null'
      ) || initialState.loggedInUser,
  };

  // Use state with the initial value from local storage
  const [state, setState] = useState<StateType>(storedState);

  // Save each piece of state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      localStorageKeys.session,
      JSON.stringify(state.session)
    );
    localStorage.setItem(localStorageKeys.user, JSON.stringify(state.user));
    localStorage.setItem(
      localStorageKeys.showMobileMenu,
      JSON.stringify(state.showMobileMenu)
    );
    localStorage.setItem(localStorageKeys.noUser, JSON.stringify(state.noUser));
    localStorage.setItem(
      localStorageKeys.imgUploadPopUp,
      JSON.stringify(state.imgUploadPopUp)
    );
    localStorage.setItem(
      localStorageKeys.aboutYou,
      JSON.stringify(state.aboutYou)
    );
    localStorage.setItem(
      localStorageKeys.isSubscribed,
      JSON.stringify(state.isSubscribed)
    );
    localStorage.setItem(
      localStorageKeys.loggedInUser,
      JSON.stringify(state.loggedInUser)
    );
  }, [state, localStorageKeys]);

  return (
    <StateContext.Provider value={{ state, setState }}>
      {children}
    </StateContext.Provider>
  );
};

// Create a custom hook to easily access the state
const useStateContext = (): StateContextType => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};

// Export the StateProvider and useStateContext
export { StateProvider, useStateContext };
