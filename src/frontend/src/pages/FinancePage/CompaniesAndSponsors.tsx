import { Box } from '@mui/system';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isAdmin, isHead } from 'shared';
import MemberCompaniesPage from './MemberCompaniesPage';
import HeadAndAboveCompaniesPage from './HeadAndAboveCompaniesPage';

const CompaniesAndSponsors: React.FC = () => {
  const user = useCurrentUser();
  return <Box>{isHead(user.role) || isAdmin(user.role) ? <HeadAndAboveCompaniesPage /> : <MemberCompaniesPage />}</Box>;
};

export default CompaniesAndSponsors;
