import React, { createContext, useContext, useState } from 'react';

interface HomePageContextProps {
  onPNMHomePage: boolean;
  onGuestHomePage: boolean;
  onOnboardingHomePage: boolean;
  onNewMemberHomePage: boolean;
  onMemberHomePage: boolean;
  setCurrentHomePage: (homePage: HomePage) => void;
}

type HomePage = 'guest' | 'member' | 'pnm' | 'onboarding' | 'new-member';

const HomePageContext = createContext<HomePageContextProps | undefined>(undefined);

export const HomePageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onGuestHomePage, setOnGuestHomePage] = useState(false);
  const [onPNMHomePage, setOnPNMHomePage] = useState(false);
  const [onOnboardingHomePage, setOnOnboardingHomePage] = useState(false);
  const [onNewMemberHomePage, setOnNewMemberHomePage] = useState(false);
  const [onMemberHomePage, setOnMemberHomePage] = useState(false);

  const setCurrentHomePage = (homePage: HomePage) => {
    setOnGuestHomePage(homePage === 'guest');
    setOnPNMHomePage(homePage === 'pnm');
    setOnOnboardingHomePage(homePage === 'onboarding');
    setOnNewMemberHomePage(homePage === 'new-member');
    setOnMemberHomePage(homePage === 'member');
  };

  return (
    <HomePageContext.Provider
      value={{
        onGuestHomePage,
        onPNMHomePage,
        onOnboardingHomePage,
        onNewMemberHomePage,
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
