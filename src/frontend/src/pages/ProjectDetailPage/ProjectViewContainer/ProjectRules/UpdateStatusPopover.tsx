/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Checkbox, FormControlLabel, Popover, Typography } from '@mui/material';
import { RuleStatus } from 'shared';

interface UpdateStatusPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  // id of the thing being updated - a ruleId in general view, or a projectRuleId in a project's view
  id: string;
  status: RuleStatus;
  onStatusChange: (id: string, status: RuleStatus) => void;
}

const UpdateStatusPopover = ({ anchorEl, onClose, id, status, onStatusChange }: UpdateStatusPopoverProps) => {
  const open = Boolean(anchorEl);

  // Selecting the already-selected option reverts to Pending
  const handleStatusChange = (selected: RuleStatus) => {
    onStatusChange(id, status === selected ? RuleStatus.PENDING : selected);
    onClose();
  };

  const statusOptions = [
    { value: RuleStatus.PASS, label: 'Pass' },
    { value: RuleStatus.FAIL, label: 'Fail' }
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
                checked={status === option.value}
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
