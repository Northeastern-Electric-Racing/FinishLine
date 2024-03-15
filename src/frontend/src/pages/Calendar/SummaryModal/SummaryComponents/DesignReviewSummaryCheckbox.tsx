import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Box } from '@mui/system';

interface DesignReviewSummaryModalCheckBoxProps {
  onChange: (checked: boolean) => void;
  checked: boolean;
}

const DesignReviewSummaryModalCheckBox: React.FC<DesignReviewSummaryModalCheckBoxProps> = ({ onChange, checked }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Box marginTop="6px">
      <FormControlLabel
        label="Mark Design Review as Complete"
        sx={{ marginBottom: 5 }}
        control={
          <Checkbox
            checked={checked}
            onChange={handleChange}
            sx={{
              color: 'inherit',
              '&.Mui-checked': { color: 'inherit' }
            }}
          />
        }
      />
    </Box>
  );
};

export default DesignReviewSummaryModalCheckBox;
