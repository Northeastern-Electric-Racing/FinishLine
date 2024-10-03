/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isGuest, isLead, isMember } from 'shared';
import IntroGuestHomePage from './IntroGuestHomePage';
import GuestHomePage from './GuestHomePage';
import { useState } from 'react';
import MemberHomePage from './MemberHomePage';
import LeadHomePage from './LeadHomePage';
import AdminHomePage from './AdminHomePage';

const Home = () => {
  const user = useCurrentUser();
  const [onMemberHomePage, setOnMemberHomePage] = useState(false);
  return isGuest(user.role) && !onMemberHomePage ? (
    <IntroGuestHomePage user={user} setOnMemberHomePage={setOnMemberHomePage} />
  ) : isMember(user.role) ? (
    <MemberHomePage user={user} />
  ) : isLead(user.role) ? (
    <LeadHomePage user={user} />
  ) : isAdmin(user.role) ? (
    <AdminHomePage user={user} />
  ) : (
    <GuestHomePage user={user} />
  );
};

export default Home;
