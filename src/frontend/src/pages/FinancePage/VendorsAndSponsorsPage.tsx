import { Box } from '@mui/system';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isHead } from 'shared';
import HeadsAndAboveCompanies from './HeadsAndAboveCompanies';
import MembersCompanies from './MembersCompanies';

const VendorsAndSponsorsPage: React.FC = () => {
  const user = useCurrentUser();

  return <Box>{isHead(user.role) || user.isFinance ? <HeadsAndAboveCompanies /> : <MembersCompanies />}</Box>;
};

export default VendorsAndSponsorsPage;
