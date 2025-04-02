import { Box } from '@mui/system';
import Companies from './CompaniesAndSponsorsTabs/Companies';
import SponsoringVendors from './CompaniesAndSponsorsTabs/SponsoringVendors';
import { useState } from 'react';
import PageLayout from '../../components/PageLayout';
import NERTabs from '../../components/Tabs';
import { routes } from '../../utils/routes';

const CompaniesAndSponsors: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <PageLayout
      title="Companies and Sponsoring Vendors"
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
  );
};

export default CompaniesAndSponsors;
