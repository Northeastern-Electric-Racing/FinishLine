/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isLead, isMember } from 'shared';
import GuestHomePage from './GuestHomePage';
import { useEffect } from 'react';
import MemberHomePage from './MemberHomePage';
import LeadHomePage from './LeadHomePage';
import AdminHomePage from './AdminHomePage';
import PopUpAlert from '../../components/PopUpAlert';
import { useHomePageContext } from '../../app/HomePageContext';

const HomePage = () => {
  const user = useCurrentUser();
  const { setCurrentHomePage } = useHomePageContext();

  useEffect(() => {
    setCurrentHomePage('member');
  }, [setCurrentHomePage]);

  return (
    <>
      {<PopUpAlert />}
      {isMember(user.role) ? (
        <MemberHomePage user={user} />
      ) : isLead(user.role) ? (
        <LeadHomePage user={user} />
      ) : isAdmin(user.role) ? (
        <AdminHomePage user={user} />
      ) : (
        <GuestHomePage user={user} />
      )}
    </>
  );
};

export default HomePage;
