/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Checkbox, FormControlLabel, Popover, Typography } from '@mui/material';
import { ProjectRule } from 'shared';

interface UpdateStatusPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  projectRule: ProjectRule;
  onStatusChange: (ruleId: string, isComplete: boolean) => void;
}

const UpdateStatusPopover = ({ anchorEl, onClose, projectRule, onStatusChange }: UpdateStatusPopoverProps) => {
  const open = Boolean(anchorEl);

  const handleStatusChange = (isComplete: boolean) => {
    onStatusChange(projectRule.rule.ruleId, isComplete);
    onClose();
  };

  const statusOptions = [
    { value: true, label: 'Completed' },
    { value: false, label: 'Incomplete' }
  ];

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right'
      }}
      PaperProps={{
        sx: {
          backgroundColor: '#ef4345',
          borderRadius: '8px',
          minWidth: 150,
          p: 1
        }
      }}
    >
      <Box>
        {statusOptions.map((option) => (
          <FormControlLabel
            key={option.label}
            control={
              <Checkbox
                checked={projectRule.rule.isComplete === option.value}
                onChange={() => handleStatusChange(option.value)}
                sx={{
                  color: 'white',
                  '&.Mui-checked': {
                    color: 'white'
                  },
                  p: 0.5
                }}
              />
            }
            label={<Typography sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{option.label}</Typography>}
            sx={{
              display: 'flex',
              m: 0,
              py: 0.5
            }}
          />
        ))}
      </Box>
    </Popover>
  );
};

export default UpdateStatusPopover;
