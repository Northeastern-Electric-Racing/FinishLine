/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { AvailableBayDashboardWidget } from 'shared';

interface WidgetSizeDropdownProps {
  title: string;
  widgets: AvailableBayDashboardWidget[];
}

/**
 * A collapsible dropdown listing the widgets available for one widget size.
 */
const WidgetSizeDropdown: React.FC<WidgetSizeDropdownProps> = ({ title, widgets }) => {
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
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 0 }}>
        {widgets.length === 0 ? (
          <Typography pl={1}>No widgets available</Typography>
        ) : (
          widgets.map((widget) => (
            <Box key={widget.type} sx={{ bgcolor: 'rgba(255, 255, 255, 0.15)', borderRadius: '10px', p: 2 }}>
              <Typography>{widget.displayName}</Typography>
            </Box>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default WidgetSizeDropdown;
