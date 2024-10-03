import { AppBar, Tab, Tabs as MUITabs, Box } from '@mui/material';
import React from 'react';

export interface TabData {
  // value: number;
  label: string;
  component: React.ReactNode;
}

const Tabs = ({
  tabs,
  tabValue,
  setTabValue,
  greyscale = false
}: {
  tabs: TabData[];
  tabValue: number;
  setTabValue: (tabValue: number) => void;
  greyscale?: boolean;
}) => {
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={greyscale ? 4 : 0}
        sx={{
          backgroundColor: greyscale ? 'inherit' : 'transparent',
          boxShadow: greyscale ? 'default' : 'none',
          borderRadius: greyscale ? '8px 8px 0 0' : 0
        }}
      >
        <MUITabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor={greyscale ? 'secondary' : 'primary'}
          textColor={greyscale ? 'inherit' : 'primary'}
        >
          {tabs.map((tab: TabData, index: number) => (
            <Tab
              key={`${tab.label}-${index}`}
              label={tab.label}
              value={index}
              sx={{
                fontWeight: 700,
                pointerEvents: tabs.length === 1 ? 'none' : 'auto',
                borderRadius: greyscale ? '8px 8px 0 0' : 0
              }}
            />
          ))}
        </MUITabs>
      </AppBar>

      <Box sx={{ mt: 2 }}>{tabs[tabValue] && tabs[tabValue].component}</Box>
    </>
  );
};

export default Tabs;
