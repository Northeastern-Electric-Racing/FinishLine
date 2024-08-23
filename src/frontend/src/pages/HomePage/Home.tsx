/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest } from 'shared';
import GuestHomePage from './GuestHomePage';
import MemberHomePage from './MemberHomePage';
import { useState } from 'react';
import PNMHomePage from './PNMHomePage';

const Home = () => {
  const user = useCurrentUser();
  const [onGuestHomePage, setOnGuestHomePage] = useState(true);
  const [onPMNHomePage, setOnPMNHomePage] = useState(false);

  if (isGuest(user.role) && onGuestHomePage) {
    return <GuestHomePage user={user} setOnGuestHomePage={setOnGuestHomePage} setOnPNMHomePage={setOnPMNHomePage} />;
  } else if (isGuest(user.role) && onPMNHomePage) {
    return <PNMHomePage />;
  }
  return <MemberHomePage user={user} />;
};

export default Home;
