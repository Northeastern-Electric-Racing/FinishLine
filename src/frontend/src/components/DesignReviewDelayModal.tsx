import { TextField, Button, Link } from '@mui/material';
import { useState, ChangeEvent } from 'react';
import { DesignReview, wbsPipe } from 'shared';
import { useToast } from '../hooks/toasts.hooks';
import { routes } from '../utils/routes';
import NERModal from './NERModal';
import { Link as RouterLink } from 'react-router-dom';

// delay wp modal component
export const DesignReviewDelayModal: React.FC<{ open: boolean; onHide: () => void; dr: DesignReview }> = ({
  open,
  onHide,
  dr
}) => {
  const toast = useToast();
  const [weeks, setWeeks] = useState<number>(1);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '' || parseInt(e.target.value) >= 1) {
      setWeeks(parseInt(e.target.value));
    } else {
      toast.error('If delaying, it must be by at least 1 week');
    }
  };

  return (
    <NERModal open={open} title="Delay WP" onHide={onHide} hideFormButtons showCloseButton>
      <TextField
        type="number"
        label="Enter number of weeks"
        variant="outlined"
        value={weeks}
        onChange={onChange}
        fullWidth
        margin="normal"
      />
      <Button
        sx={{
          color: 'white',
          backgroundColor: '#EF4345',
          ':hover': { backgroundColor: '#A72D2D' },
          fontSize: 10,
          fontWeight: 'bold',
          marginLeft: '75%',
          marginTop: '10px'
        }}
      >
        <Link
          underline="none"
          color={'text.primary'}
          component={RouterLink}
          to={`${routes.CHANGE_REQUESTS}/new?wbsNum=${wbsPipe(dr.wbsNum)}&timelineDelay=${weeks >= 1 ? weeks : 1}`}
        >
          Delay
        </Link>
      </Button>
    </NERModal>
  );
};
