import { AppBar, Tab, Tabs } from '@mui/material';

interface TabData {
  value: number;
  label: string;
}

const FinanceTabs = ({
  tabs,
  tabValue,
  setTabValue
}: {
  tabs: TabData[];
  tabValue: number;
  setTabValue: (tabValue: number) => void;
}) => {
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AppBar sx={{ borderRadius: '8px 8px 0 0' }} position="static">
      <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth">
        {tabs.map((tab: TabData, index: number) => (
          <Tab
            sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700, pointerEvents: tabs.length === 1 ? 'none' : 'auto' }}
            label={tab.label}
            value={tab.value}
            key={`${tab.label}-${index}`}
          />
        ))}
      </Tabs>
    </AppBar>
  );
};

export default FinanceTabs;
