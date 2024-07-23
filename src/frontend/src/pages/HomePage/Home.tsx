/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useCurrentUser } from '../../hooks/users.hooks';
import { isGuest } from 'shared';
import GuestHomePage from './GuestHomePage';
import MemberHomePage from './MemberHomePage';

interface HomeProps {
  clickedFinishline: boolean;
  setClickedFinishline: (value: boolean) => void;
}

const Home = ({ clickedFinishline, setClickedFinishline }: HomeProps) => {
  const user = useCurrentUser();

  return isGuest(user.role) && !clickedFinishline ? (
    <GuestHomePage user={user} setClickedFinishline={setClickedFinishline} />
  ) : (
    <MemberHomePage user={user} />
  );
};

export default Home;
