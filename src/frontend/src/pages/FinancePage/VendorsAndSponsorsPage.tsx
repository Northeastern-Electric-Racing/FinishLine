import React, { useState } from 'react';
import FullPageTabs from '../../components/FullPageTabs';
import PageLayout from '../../components/PageLayout';
import { routes } from '../../utils/routes';
import { Box } from '@mui/system';
import SponsorsTable from './SponsorsTable';
import VendorsTable from './VendorsTable';

const VendorsAndSponsorsPage = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabs = [
    { tabUrlValue: 'vendors', tabName: 'Vendors' },
    { tabUrlValue: 'sponsors', tabName: 'Sponsors' }
  ];

  return (
    <Box>
      <PageLayout
        title="Vendors and Sponsors"
        tabs={
          <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
            <FullPageTabs
              noUnderline
              setTab={setTabIndex}
              tabsLabels={tabs}
              baseUrl={routes.COMPANIES}
              defaultTab={'vendors'}
              id="companies-sponsor-tabs"
            />
          </Box>
        }
      >
        {tabIndex === 0 ? <VendorsTable isHeadAndAbove={true} /> : <SponsorsTable />}
      </PageLayout>
    </Box>
  );
};

export default VendorsAndSponsorsPage;
