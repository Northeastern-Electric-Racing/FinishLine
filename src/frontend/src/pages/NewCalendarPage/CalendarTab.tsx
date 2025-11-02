import { routes } from '../../utils/routes';
import NewCalendarPage from './NewCalendarPage';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import FullPageTabs from '../../components/FullPageTabs';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';
import { isHead, isLead } from 'shared';
import SettingsPage from '../SettingsPage/SettingsPage';

const CalendarTab: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const user = useCurrentUser();
  const canViewReviews = isHead(user.role) || isLead(user.role);
  const tabs = [
    { tabUrlValue: 'mainCalendar', tabName: 'Calendar' },
    { tabUrlValue: 'yourEvents', tabName: 'Your Events' }
  ];

  if (canViewReviews) tabs.push({ tabUrlValue: 'reviews', tabName: 'Review Bookings' });

  return (
    <PageLayout
      title="Calendar"
      tabs={
        <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
          <FullPageTabs
            noUnderline
            setTab={setTabIndex}
            tabsLabels={tabs}
            baseUrl={routes.NEW_CALENDAR}
            defaultTab="mainCalendar"
            id="calendar-tabs"
          />
        </Box>
      }
    >
      {tabIndex === 1 ? <NewCalendarPage /> : tabIndex === 0 ? <NewCalendarPage /> : <SettingsPage />}
    </PageLayout>
  );
};

export default CalendarTab;
