import React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

interface DesignReviewSummaryModalCheckBoxProps {
  onChange: (checked: boolean) => void;
  checked: boolean;
}

const DesignReviewSummaryModalCheckBox: React.FC<DesignReviewSummaryModalCheckBoxProps> = ({ onChange, checked }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <FormControlLabel
      label="Mark Design Review as Complete"
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
  );
};

export default DesignReviewSummaryModalCheckBox;
