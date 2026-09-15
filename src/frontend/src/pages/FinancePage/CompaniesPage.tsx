import { Box } from '@mui/system';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isHead } from 'shared';
import VendorsAndSponsorsPage from './VendorsAndSponsorsPage';
import VendorsPage from './VendorsPage';

const CompaniesPage: React.FC = () => {
  const user = useCurrentUser();

  return <Box>{isHead(user.role) || user.isFinance ? <VendorsAndSponsorsPage /> : <VendorsPage />}</Box>;
};

export default CompaniesPage;
