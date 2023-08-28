import { useEffect, useState } from 'react';
import { useLocation, useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';

interface TabProps {
  setTab: (value: number) => void;
  tabUrlValues: string[]; // Values that go in the URL depending on the tab value, example /projects/0.0.0/scope
  tabNames: string[]; // Values that are displayed for the tab names
  baseUrl: string;
  defaultTab: string;
  id: string;
}

// Page block containing project detail tabs
const NERTabs = ({ setTab, tabUrlValues, baseUrl, defaultTab, id, tabNames }: TabProps) => {
  const match = useRouteMatch<{ tabValueString: string }>(`${baseUrl}/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;

  // Default to the "overview" tab
  const initialTab: number = tabUrlValues.indexOf(tabValueString ?? defaultTab);
  const [tabValue, setTabValue] = useState<number>(initialTab);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? defaultTab);
    setTab(newTabValue);
    setTabValue(newTabValue);
  }, [pathname, setTab, setTabValue, tabUrlValues, tabValueString, defaultTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTab(newValue);
    setTabValue(newValue);
  };

  return (
    <Tabs
      sx={{ borderBottom: 1, borderColor: 'divider' }}
      value={tabValue}
      onChange={handleTabChange}
      aria-label={`${id}-tabs`}
    >
      {tabUrlValues.map((tab, idx) => (
        <Tab label={tabNames[idx]} aria-label={tab} value={idx} component={RouterLink} to={`${baseUrl}/${tab}`} />
      ))}
    </Tabs>
  );
};

export default NERTabs;
