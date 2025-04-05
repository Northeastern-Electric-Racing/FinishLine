import { Box } from '@mui/system';
import VendorsTable from '../AdminToolsPage/FinanceConfig/VendorsTable';

const CompaniesAndSponsors: React.FC = () => {
  return (
    <Box>
      <Box>Companies and Sponsoring Vendors</Box>
      <Box sx={{ marginTop: '50px' }}>
        <VendorsTable />
      </Box>
    </Box>
  );
};

export default CompaniesAndSponsors;
