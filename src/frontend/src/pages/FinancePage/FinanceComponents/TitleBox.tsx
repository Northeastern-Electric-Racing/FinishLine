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
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: '500px',
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
          sx={{
            mb: 2,
            width: '100%',
            '& .MuiTabs-flexContainer': {
              display: 'flex',
              justifyContent: 'space-between'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#dd514c',
              height: '3px'
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
              sx={{
                textTransform: 'none',
                flex: 1,
                maxWidth: 'none',
                color: 'white',
                fontWeight: 500,
                fontSize: '1rem',
                '&.Mui-selected': {
                  color: 'white'
                }
              }}
            />
          ))}
        </Tabs>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0,
          minWidth: '100%'
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default TitleBox;
