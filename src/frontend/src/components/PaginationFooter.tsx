import { Box, TablePagination } from '@mui/material';
import { ReactNode } from 'react';

interface PaginationFooterProps {
  footerButton?: ReactNode;
  footerInfoBoxes?: ReactNode[];
  totalItems: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  rowsPerPageOptions?: number[];
}

const PaginationFooter = ({
  footerButton,
  footerInfoBoxes = [],
  totalItems,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100]
}: PaginationFooterProps) => {
  return (
    <>
      <Box
        sx={{
          backgroundColor: '#121313',
          position: 'fixed',
          bottom: 0,
          zIndex: 2,
          width: '100%'
        }}
      >
        <Box
          sx={{
            borderBottom: '2px solid white',
            mb: 2,
            width: 'calc(100% - 60px)'
          }}
        />
        {footerButton && <Box sx={{ display: 'inline-block', mb: 1, mr: 2 }}>{footerButton}</Box>}

        {footerInfoBoxes.map((infoBox, index) => (
          <Box
            key={index}
            sx={{
              padding: '5px 20px',
              mb: 2,
              mr: 2,
              display: 'inline-flex',
              backgroundColor: '#3a3b3b',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 700
            }}
          >
            {infoBox}
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          padding: '16px 16px',
          zIndex: 3
        }}
      >
        <TablePagination
          count={totalItems}
          page={currentPage}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={onRowsPerPageChange}
          labelDisplayedRows={({ page }) => `Page ${page + 1}`}
        />
      </Box>
    </>
  );
};

export default PaginationFooter;
