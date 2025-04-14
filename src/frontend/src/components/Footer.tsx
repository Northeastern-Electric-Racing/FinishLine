import { ChevronRight } from '@mui/icons-material';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface FooterProps {
  footerButton?: ReactNode;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const Footer = ({ footerButton, totalPages, currentPage, setCurrentPage }: FooterProps) => {
  const theme = useTheme();
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderTop: '1px solid white',
        backgroundColor: theme.palette.background.default,
        position: 'fixed',
        bottom: 0,
        width: 'calc(100% - 60px)',
        height: '7%'
      }}
    >
      {footerButton}
      <Box
        sx={{
          display: 'flex',
          marginLeft: 'auto'
        }}
      >
        <Typography sx={{ marginRight: '4px' }}>
          Page {currentPage} of {totalPages}
        </Typography>
        <IconButton
          size="small"
          sx={{
            padding: '2px',
            marginLeft: '4px'
          }}
          onClick={handleNextPage}
        >
          <ChevronRight fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Footer;
