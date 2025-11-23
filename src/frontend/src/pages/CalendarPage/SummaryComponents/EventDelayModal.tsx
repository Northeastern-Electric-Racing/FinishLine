import { TextField, Link, FormLabel, FormControl } from '@mui/material';
import { useState, ChangeEvent } from 'react';
import { Event, wbsPipe } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import NERModal from '../../../components/NERModal';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { routes } from '../../../utils/routes';

export const EventDelayModal: React.FC<{ open: boolean; onHide: () => void; event: Event }> = ({ open, onHide, event }) => {
  const toast = useToast();
  const [weeks, setWeeks] = useState<number>(1);
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '' || parseInt(e.target.value) >= 1) {
      setWeeks(parseInt(e.target.value));
    } else {
      toast.error('If delaying, it must be by at least 1 week');
    }
  };

  const [firstWorkPackage] = event.workPackages;

  const wbsNumber = firstWorkPackage
    ? {
        carNumber: firstWorkPackage.wbsElement.carNumber,
        projectNumber: firstWorkPackage.wbsElement.projectNumber,
        workPackageNumber: firstWorkPackage.wbsElement.workPackageNumber
      }
    : { carNumber: 0, projectNumber: 0, workPackageNumber: 0 };

  return (
    <NERModal open={open} title="Delay WP" onHide={onHide} hideFormButtons showCloseButton>
      <FormControl fullWidth>
        <FormLabel>Enter number of weeks</FormLabel>
        <TextField type="number" variant="outlined" value={weeks} onChange={onChange} fullWidth margin="normal" />
      </FormControl>
      <NERSuccessButton
        sx={{
          marginLeft: '75%',
          marginTop: '10px'
        }}
      >
        <Link
          underline="none"
          color={'text.primary'}
          component={RouterLink}
          to={`${routes.CHANGE_REQUESTS}/new?wbsNum=${wbsPipe(wbsNumber)}&timelineDelay=${weeks >= 1 ? weeks : 1}`}
        >
          Delay
        </Link>
      </NERSuccessButton>
    </NERModal>
  );
};
