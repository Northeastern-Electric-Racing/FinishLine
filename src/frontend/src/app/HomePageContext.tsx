import React, { createContext, useContext, useState } from 'react';

interface HomePageContextProps {
  onPNMHomePage: boolean;
  onGuestHomePage: boolean;
  onOnboardingHomePage: boolean;
  onMemberHomePage: boolean;
  setCurrentHomePage: (homePage: HomePage) => void;
}

type HomePage = 'guest' | 'member' | 'pnm' | 'onboarding';

const HomePageContext = createContext<HomePageContextProps | undefined>(undefined);

export const HomePageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onGuestHomePage, setOnGuestHomePage] = useState(false);
  const [onPNMHomePage, setOnPNMHomePage] = useState(false);
  const [onOnboardingHomePage, setOnOnboardingHomePage] = useState(false);
  const [onMemberHomePage, setOnMemberHomePage] = useState(false);

  const setCurrentHomePage = (homePage: HomePage) => {
    switch (homePage) {
      case 'guest':
        setOnPNMHomePage(false);
        setOnOnboardingHomePage(false);
        setOnMemberHomePage(false);
        setOnGuestHomePage(true);
        break;
      case 'member':
        setOnGuestHomePage(false);
        setOnPNMHomePage(false);
        setOnOnboardingHomePage(false);
        setOnMemberHomePage(true);
        break;
      case 'onboarding':
        setOnPNMHomePage(false);
        setOnGuestHomePage(false);
        setOnMemberHomePage(false);
        setOnOnboardingHomePage(true);
        break;
      case 'pnm':
        setOnGuestHomePage(false);
        setOnMemberHomePage(false);
        setOnOnboardingHomePage(false);
        setOnPNMHomePage(true);
    }
  };

  return (
    <HomePageContext.Provider
      value={{
        onGuestHomePage,
        onPNMHomePage,
        onOnboardingHomePage,
        onMemberHomePage,
        setCurrentHomePage
      }}
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
