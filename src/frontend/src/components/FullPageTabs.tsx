import { useEffect, useState } from 'react';
import { useRouteMatch, Link as RouterLink } from 'react-router-dom';
import { Tab, Tabs } from '@mui/material';

interface TabInfo {
  tabUrlValue: string;
  tabName: string;
}

interface TabProps {
  setTab: (value: number) => void;
  tabsLabels: TabInfo[]; // Values that go in the URL depending on the tab value, example /projects/0.0.0/scope, and names that are displayed
  baseUrl: string; //the URL that all the tab URLs extend
  defaultTab: string; //tab that the tabs component defaults to
  id: string;
  noUnderline?: boolean;
}

const FullPageTabs = ({ setTab, tabsLabels, baseUrl, defaultTab, id, noUnderline = false }: TabProps) => {
  const tabUrlValues = tabsLabels.map((tab) => tab.tabUrlValue);
  const match = useRouteMatch<{ tabValueString: string }>(`${baseUrl}/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;

  const initialTab: number = tabUrlValues.indexOf(tabValueString ?? defaultTab);
  const [tabValue, setTabValue] = useState<number>(initialTab);

  // Change tab when the browser forward/back button is pressed
  useEffect(() => {
    const newTabValue: number = tabUrlValues.indexOf(tabValueString ?? defaultTab);
    setTab(newTabValue);
    setTabValue(newTabValue);
  }, [setTab, setTabValue, tabUrlValues, tabValueString, defaultTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTab(newValue);
    setTabValue(newValue);
  };

  return (
    <Tabs value={tabValue} onChange={handleTabChange} aria-label={`${id}-tabs`}>
      {tabsLabels.map((tab, idx) => (
        <Tab
          sx={noUnderline ? {} : { borderBottom: 1, borderColor: 'divider' }}
          label={tab.tabName}
          aria-label={tab.tabUrlValue}
          value={idx}
          key={`${tab.tabName}-${idx}`}
          component={RouterLink}
          to={`${baseUrl}/${tab.tabUrlValue}`}
        />
      ))}
    </Tabs>
  );
};

export default FullPageTabs;
