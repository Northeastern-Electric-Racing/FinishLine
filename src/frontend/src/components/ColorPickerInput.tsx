import React from 'react';
import { Box, Stack } from '@mui/material';

const DEFAULT_COLOR_OPTIONS: { label: string; value: string }[] = [
  { label: 'Red', value: '#EF4444' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Yellow', value: '#EAB308' },
  { label: 'Green', value: '#22C55E' },
  { label: 'Blue', value: '#3B82F6' },
  { label: 'Purple', value: '#A855F7' },
  { label: 'Pink', value: '#EC4899' },
  { label: 'Navy', value: '#1E3A8A' }
];

interface ColorPickerInputProps {
  selectedColor: string;
  onColorClick: (value: string) => void;
}

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ selectedColor, onColorClick }) => {
  return (
    <Stack direction="row" spacing={1.2} flexWrap="wrap" sx={{ mt: 0.5 }}>
      {DEFAULT_COLOR_OPTIONS.map((c) => (
        <Box
          key={c.value}
          onClick={() => onColorClick(c.value)}
          sx={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 1.5,
            height: 28,
            borderRadius: '999px',
            backgroundColor: c.value,
            border: c.value === selectedColor ? '2px solid #ef4345' : '2px solid transparent',
            boxSizing: 'border-box',
            minWidth: 32
          }}
        />
      ))}
    </Stack>
  );
};

export default ColorPickerInput;
