import { Box, Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';

import { ChevronRight } from '@mui/icons-material';
import React, { useState } from 'react';

interface DropdownProps {
  title: string;
  description: string;
}

const Dropdown = ({ title, description }: DropdownProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Box marginBottom={2}>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          backgroundColor: '#ef4244',
          borderRadius: '20px !important',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary
          sx={{
            flexDirection: 'row-reverse',
            borderRadius: '20px',
            backgroundColor: '#ef4244'
          }}
        >
          <ChevronRight
            sx={{
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
              fontSize: 30
            }}
          />
          <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails
          sx={{
            backgroundColor: '#D9D9D9',
            borderRadius: '0 0 15px 15px',
            minHeight: '60px'
          }}
        >
          <Typography sx={{ color: 'black' }}>{description}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Dropdown;
