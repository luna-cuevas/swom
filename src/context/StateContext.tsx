'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

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

const StateContext = createContext<StateContextType | undefined>(undefined);

const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const [state, setState] = useState<StateType>(initialState);

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
