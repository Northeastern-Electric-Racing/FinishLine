/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest } from 'shared';
import GuestHomePage from './GuestHomePage';
import MemberHomePage from './MemberHomePage';
import PNMHomePage from './PNMHomePage';
import { useHomePageContext } from '../../app/HomePageContext';

const Home = () => {
  const user = useCurrentUser();
  const { onGuestHomePage, setOnGuestHomePage, onPNMHomePage, setOnPNMHomePage } = useHomePageContext();

  if (isGuest(user.role) && onGuestHomePage) {
    return <GuestHomePage user={user} setOnGuestHomePage={setOnGuestHomePage} setOnPNMHomePage={setOnPNMHomePage} />;
  } else if (isGuest(user.role) && onPNMHomePage) {
    return <PNMHomePage />;
  }
  return <MemberHomePage user={user} />;
};

export default Home;
