import React, { createContext, useContext, useEffect, useState } from 'react';

interface HomePageContextProps {
  onPNMHomePage: boolean;
  setOnPNMHomePage: (value: boolean) => void;
  onGuestHomePage: boolean;
  setOnGuestHomePage: (value: boolean) => void;
}

const HomePageContext = createContext<HomePageContextProps | undefined>(undefined);

export const HomePageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onGuestHomePage, setOnGuestHomePage] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem('onGuestHomePage') || 'true')
  );
  const [onPNMHomePage, setOnPNMHomePage] = useState<boolean>(() =>
    JSON.parse(localStorage.getItem('onPNMHomePage') || 'false')
  );

  useEffect(() => {
    localStorage.setItem('onGuestHomePage', JSON.stringify(onGuestHomePage));
  }, [onGuestHomePage]);

  useEffect(() => {
    localStorage.setItem('onPNMHomePage', JSON.stringify(onPNMHomePage));
  }, [onPNMHomePage]);

  return (
    <HomePageContext.Provider value={{ onGuestHomePage, setOnGuestHomePage, onPNMHomePage, setOnPNMHomePage }}>
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
