import { Box } from '@mui/system';
import Companies from './CompaniesAndSponsorsTabs/Companies';
import SponsoringVendors from './CompaniesAndSponsorsTabs/SponsoringVendors';
import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';
import { Typography } from '@mui/material';

const CompaniesAndSponsors: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <Box>
      <Typography variant="h3" sx={{ mt: 1, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '3rem' } }}>
        Companies and Sponsoring Vendors
      </Typography>
      <PageLayout
        title=" "
        tabs={
          <NERTabs
            setTab={setTabIndex}
            tabsLabels={[
              { tabUrlValue: 'companies', tabName: 'Companies' },
              { tabUrlValue: 'sponsoring-vendors', tabName: 'Sponsoring Vendors' }
            ]}
            baseUrl={routes.COMPANIES_SPONSORS}
            defaultTab="companies"
            id="companies-and-sponsors-tabs"
          />
        }
      >
        {tabIndex === 0 ? <Companies /> : <SponsoringVendors />}
      </PageLayout>
    </Box>
  );
};

export default CompaniesAndSponsors;
