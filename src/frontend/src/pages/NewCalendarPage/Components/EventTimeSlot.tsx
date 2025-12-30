import { Box } from '@mui/system';

interface EventTimeSlotProps {
  backgroundColor?: string;
  onClick?: () => void;
  selected?: boolean;
}

const EventTimeSlot: React.FC<EventTimeSlotProps> = ({ backgroundColor, onClick, selected = false }) => {
  return (
    <Box onClick={onClick} p={0.5}>
      <Box
        sx={{
          borderRadius: 1,
          bgcolor: backgroundColor,
          width: '100%',
          height: '100%',
          minHeight: 54,
          display: 'flex',
          borderStyle: 'solid',
          borderColor: selected ? '#ffff8c' : 'gray',
          borderWidth: selected ? '2px' : '0.1px'
        }}
      />
    </Box>
  );
};

export default EventTimeSlot;
