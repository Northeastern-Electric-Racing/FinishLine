import React, { useState } from 'react';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import CompaniesTable from './CompaniesTable';
import SponsorsTable from './SponsorsTable';

const HeadAndAboveCompaniesPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'companies', tabName: 'Companies' },
    { tabUrlValue: 'vendors', tabName: 'Sponsoring Vendors' }
  ];

  return (
    <Box>
      <PageLayout
        title="Companies and Sponsoring Vendors"
        tabs={
          <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
            <FullPageTabs
              noUnderline
              setTab={setTabIndex}
              tabsLabels={tabs}
              baseUrl={routes.COMPANIES_SPONSORS}
              defaultTab={'companies'}
              id="companies-sponsor-tabs"
            />
          </Box>
        }
      >
        {tabIndex === 0 ? <CompaniesTable /> : <SponsorsTable />}
      </PageLayout>
    </Box>
  );
};

export default HeadAndAboveCompaniesPage;
