import { Box, Card, Typography, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CustomSelectProps {
  options: string[];
  onSelect: (selectedOption: number) => void;
  selected?: number;
}

const WorkPackageSelect: React.FC<CustomSelectProps> = ({ options, onSelect, selected = 0 }) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: string) => {
    setIsOpen(false);
    onSelect(options.indexOf(option));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <Box ref={dropdownRef} sx={{ position: 'relative' }}>
      <Typography
        onClick={() => setIsOpen(!isOpen)}
        variant="h5"
        sx={{ paddingX: 2, paddingY: 1, display: 'inline-block', cursor: 'pointer' }}
      >
        <ExpandMoreIcon sx={{ ml: -1, paddingRight: 0.5 }} />
        {options[selected]}
      </Typography>
      {isOpen && (
        <Box onClick={() => setIsOpen(!isOpen)} sx={{ position: 'absolute', top: '-40%', cursor: 'pointer' }}>
          <Card sx={{ my: 2, background: theme.palette.background.paper }} variant="outlined">
            <Typography
              sx={{
                paddingX: 2,
                paddingY: 1,
                position: 'relative',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover
                }
              }}
              variant="h5"
            >
              {options[selected]}
            </Typography>
            {options
              .filter((option) => option !== options.at(selected))
              .map((option) => (
                <Typography
                  key={option}
                  onClick={() => {
                    handleSelect(option);
                  }}
                  sx={{
                    cursor: 'pointer',
                    paddingX: 2,
                    paddingY: 1,
                    backgroundColor: theme.palette.background.paper,
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                  variant="h5"
                >
                  {option}
                </Typography>
              ))}
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default WorkPackageSelect;
