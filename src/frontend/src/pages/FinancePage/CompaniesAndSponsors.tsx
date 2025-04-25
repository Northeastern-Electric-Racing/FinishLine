import { Box } from '@mui/system';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isHead } from 'shared';
import MemberCompaniesPage from './MemberCompaniesPage';
import HeadAndAboveCompaniesPage from './HeadAndAboveCompaniesPage';

const CompaniesAndSponsors: React.FC = () => {
  const user = useCurrentUser();

  return <Box>{isHead(user.role) || user.isFinance ? <HeadAndAboveCompaniesPage /> : <MemberCompaniesPage />}</Box>;
};

export default CompaniesAndSponsors;
