/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Accordion, AccordionDetails, AccordionSummary, ButtonBase, Typography } from '@mui/material';
import { AddCircle, ExpandMore, RemoveCircle } from '@mui/icons-material';
import { useState } from 'react';
import { AvailableBayDashboardWidget, BayDashboardWidgetType } from 'shared';

interface WidgetSizeDropdownProps {
  title: string;
  widgets: AvailableBayDashboardWidget[];
  selectedType?: BayDashboardWidgetType;
  onSelect: (type: BayDashboardWidgetType) => void;
}

/**
 * A collapsible dropdown listing the widgets available for one widget size. 
 * Clicking a widget selects it, and only one widget is highlighted at a time (until phase 3 widget rotations)
 */
const WidgetSizeDropdown: React.FC<WidgetSizeDropdownProps> = ({ title, widgets, selectedType, onSelect }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      elevation={0}
      sx={{ backgroundColor: 'transparent', '&:before': { display: 'none' }, mx: -2 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          ml: 2,
          width: 'calc(100% - 32px)',
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
      <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2, px: 2 }}>
        {widgets.length === 0 ? (
          <Typography pl={1}>No widgets available</Typography>
        ) : (
          widgets.map((widget) => (
            <ButtonBase
              key={widget.type}
              onClick={() => onSelect(widget.type)}
              aria-pressed={widget.type === selectedType}
              sx={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                p: 2,
                position: 'relative',
                border: '2px solid',
                borderColor: widget.type === selectedType ? 'primary.main' : 'transparent'
              }}
            >
              {widget.type === selectedType ? (
                <RemoveCircle fontSize="small" sx={{ position: 'absolute', top: -11, left: -11, color: 'primary.main' }} />
              ) : (
                <AddCircle fontSize="small" sx={{ position: 'absolute', top: -11, left: -11, color: 'white' }} />
              )}
              <Typography>{widget.displayName}</Typography>
            </ButtonBase>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default WidgetSizeDropdown;
