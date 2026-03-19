import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Box } from '@mui/system';

interface NERArrowsProps {
  onLeftArrowPressed: () => void;
  onRightArrowPressed: () => void;
}
const NERArrows = ({ onLeftArrowPressed, onRightArrowPressed }: NERArrowsProps) => {
  return (
    <Box display={'flex'} justifyContent={'space-around'}>
      <Button size="small" onClick={onLeftArrowPressed} sx={{ marginRight: '5px' }}>
        <KeyboardArrowLeft />
      </Button>
      <Button size="small" onClick={onRightArrowPressed} sx={{ marginLeft: '5px' }}>
        <KeyboardArrowRight />
      </Button>
    </Box>
  );
};

export default NERArrows;
