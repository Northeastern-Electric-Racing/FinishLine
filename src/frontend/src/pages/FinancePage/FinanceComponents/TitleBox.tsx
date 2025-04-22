import { Box, Paper, Typography, Tabs, Tab } from '@mui/material';
import React from 'react';

interface TabItem {
  label: string;
  value: string;
}

interface TitleBoxProps {
  title: string;
  tabs?: TabItem[];
  selectedTab?: string;
  onTabChange?: (value: string) => void;
  children: React.ReactNode;
}

const TitleBox: React.FC<TitleBoxProps> = ({ title, tabs, selectedTab, onTabChange, children }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        backgroundColor: '#2c2c2c',
        borderRadius: 2,
        color: 'white',
        height: '100%'
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
        {title}
      </Typography>

      {tabs && onTabChange && (
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{ mb: 2 }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} sx={{ textTransform: 'none' }} />
          ))}
        </Tabs>
      )}

      <Box>{children}</Box>
    </Paper>
  );
};

export default TitleBox;
