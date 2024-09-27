import { Box, Accordion, AccordionSummary, Typography, AccordionDetails } from '@mui/material';

import { KeyboardArrowDown } from '@mui/icons-material';

interface DropdownProps {
  title: string;
  description: string;
}

const Dropdown = ({ title, description }: DropdownProps) => {
  return (
    <Box marginBottom={2}>
      <Accordion
        sx={{
          backgroundColor: '#ef4244'
        }}
      >
        <AccordionSummary
          expandIcon={<KeyboardArrowDown />}
          sx={{ flexDirection: 'row-reverse', borderBottomLeftRadius: '100px', borderBottomRightRadius: '100px' }}
        >
          <Typography sx={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: 'white', borderBottomLeftRadius: '4px', borderBottomRightRadius: '4px' }}>
          <Typography sx={{ color: 'black' }}>{description}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Dropdown;
