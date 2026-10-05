/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';

interface WidgetSizeDropdownProps {
  title: string;
}

/**
 * A collapsible dropdown for one widget size.
 */
const WidgetSizeDropdown: React.FC<WidgetSizeDropdownProps> = ({ title }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      sx={{ backgroundColor: 'transparent', '&:before': { display: 'none' } }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: '12px 12px 0 0',
          borderBottom: '1px solid white',
          '& .MuiAccordionSummary-expandIconWrapper': { color: 'white' }
        }}
      >
        <Typography variant="h6" pl={1}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails />
    </Accordion>
  );
};

export default WidgetSizeDropdown;
