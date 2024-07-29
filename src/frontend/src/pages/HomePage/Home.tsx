/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest } from 'shared';
import GuestHomePage from './GuestHomePage';
import MemberHomePage from './MemberHomePage';
import { useHistoryState } from '../../hooks/misc.hooks';

const Home = () => {
  const user = useCurrentUser();
  const [onMemberHomePage, setOnMemberHomePage] = useHistoryState('', false);

  return isGuest(user.role) && !onMemberHomePage ? (
    <GuestHomePage user={user} setOnMemberHomePage={setOnMemberHomePage} />
  ) : (
    <MemberHomePage user={user} />
  );
};

export default Home;
