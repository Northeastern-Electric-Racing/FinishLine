import { AppBar, Box, Tab, Tabs } from '@mui/material';

interface TabData {
  label: string;
  component: React.ReactNode;
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
    <>
      <AppBar color="transparent" sx={{ borderRadius: '8px 8px 0 0', mb: 2 }} position="static">
        <Tabs value={tabValue} onChange={handleTabChange}>
          {tabs.map((tab: TabData, index: number) => (
            <Tab
              sx={{ fontWeight: 700, pointerEvents: tabs.length === 1 ? 'none' : 'auto' }}
              label={tab.label}
              key={`${tab.label}-${index}`}
            />
          ))}
        </Tabs>
      </AppBar>
      <Box sx={{ mt: 2 }}>{tabs[tabValue] && tabs[tabValue].component}</Box>
    </>
  );
};

export default FinanceTabs;
