import { AppBar, Tab, Tabs as MUITabs } from '@mui/material';

export interface TabData {
  value: number;
  label: string;
}

const Tabs = ({
  tabs,
  tabValue,
  setTabValue,
  isFinance = false,
}: {
  tabs: TabData[];
  tabValue: number;
  setTabValue: (tabValue: number) => void;
  isFinance?: boolean;
}) => {
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AppBar
      position="static"
      elevation={isFinance ? 4 : 0}
      sx={{
        backgroundColor: isFinance ? 'inherit' : 'transparent',
        boxShadow: isFinance ? 'default' : 'none',
        borderRadius: isFinance ? '8px 8px 0 0' : 0,
      }}
    >
      <MUITabs
        value={tabValue}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor={isFinance ? 'secondary' : 'primary'}
        textColor={isFinance ? 'inherit' : 'primary'}
      >
        {tabs.map((tab: TabData, index: number) => (
          <Tab
            key={`${tab.label}-${index}`}
            label={tab.label}
            value={tab.value}
            sx={{
              fontWeight: 700,
              pointerEvents: tabs.length === 1 ? 'none' : 'auto',
              borderRadius: isFinance ? '8px 8px 0 0' : 0,
            }}
          />
        ))}
      </MUITabs>
    </AppBar>
  );
};

export default Tabs;
