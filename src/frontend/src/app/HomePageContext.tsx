import React, { createContext, useContext, useState } from 'react';

interface HomePageContextProps {
  onPNMHomePage: boolean;
  setOnPNMHomePage: (value: boolean) => void;
  onGuestHomePage: boolean;
  setOnGuestHomePage: (value: boolean) => void;
}

const HomePageContext = createContext<HomePageContextProps | undefined>(undefined);

export const HomePageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onGuestHomePage, setOnGuestHomePage] = useState(true);
  const [onPNMHomePage, setOnPNMHomePage] = useState(false);

  return (
    <HomePageContext.Provider
      value={{ onGuestHomePage, setOnGuestHomePage, onPNMHomePage, setOnPNMHomePage }}
    >
      {children}
    </HomePageContext.Provider>
  );
};

export const useHomePageContext = () => {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePageContext must be used within a HomePageProvider');
  }
  return context;
};
