import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import EditAvailability from './EditAvailability';
import { Box, useMediaQuery } from '@mui/system';
import PageLayout from '../../../../components/PageLayout';
import NERFailButton from '../../../../components/NERFailButton';
import NERSuccessButton from '../../../../components/NERSuccessButton';
import { useHistory } from 'react-router-dom';

interface DRCEditModalProps {
  open: boolean;
  header: string;
  confirmedAvailabilities: Map<number, Availability>;
  totalAvailabilities: Availability[];
  setConfirmedAvailabilities: (availabilities: Map<number, Availability>) => void;
  onHide: () => void;
  onSubmit: () => void;
  initialDate: Date;
  canChangeDateRange?: boolean;
}

const AvailabilityEditModal: React.FC<DRCEditModalProps> = ({
  open,
  onHide,
  header,
  confirmedAvailabilities,
  setConfirmedAvailabilities,
  totalAvailabilities,
  onSubmit,
  initialDate,
  canChangeDateRange = true
}) => {
  const onCancel = () => {
    setConfirmedAvailabilities(new Map());
    onHide();
  };

  const isMobile = useMediaQuery('(max-width:480px)');

  if (isMobile && !open) return null; // do not want mobile to fall to computer version
  if (isMobile && open) {
    return (
      <PageLayout
        title={header}
        headerRight={
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <NERFailButton variant="contained" onClick={onCancel}>
              {' '}
              CANCEL{' '}
            </NERFailButton>
            <NERSuccessButton variant="contained" onClick={onSubmit}>
              {' '}
              SAVE{' '}
            </NERSuccessButton>
          </Box>
        }
      >
        <EditAvailability
          editedAvailabilities={confirmedAvailabilities}
          setEditedAvailabilities={setConfirmedAvailabilities}
          totalAvailabilities={totalAvailabilities}
          canChangeDateRange={canChangeDateRange}
          initialDate={initialDate}
        />
      </PageLayout>
    );
  }
  return (
    <NERModal
      open={open}
      onHide={onCancel}
      title={header}
      onSubmit={onSubmit}
      submitText="Save"
      paperProps={{ maxWidth: '1200px', height: '85vh' }}
    >
      <EditAvailability
        editedAvailabilities={confirmedAvailabilities}
        setEditedAvailabilities={setConfirmedAvailabilities}
        totalAvailabilities={totalAvailabilities}
        canChangeDateRange={canChangeDateRange}
        initialDate={initialDate}
      />
    </NERModal>
  );
};
export default AvailabilityEditModal;
