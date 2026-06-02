import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import EditAvailability from './EditAvailability';
import { Box, useMediaQuery } from '@mui/system';
import PageLayout from '../../../../components/PageLayout';
import NERFailButton from '../../../../components/NERFailButton';
import NERSuccessButton from '../../../../components/NERSuccessButton';

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
  showImportedCalendarBusy?: boolean;
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
  canChangeDateRange = true,
  showImportedCalendarBusy
}) => {
  const onCancel = () => {
    setConfirmedAvailabilities(new Map());
    onHide();
  };

  const isMobile = useMediaQuery('(max-width:480px)');

  if (isMobile && open) {
    return (
      <PageLayout title={header}>
        <EditAvailability
          editedAvailabilities={confirmedAvailabilities}
          setEditedAvailabilities={setConfirmedAvailabilities}
          totalAvailabilities={totalAvailabilities}
          canChangeDateRange={canChangeDateRange}
          initialDate={initialDate}
          showImportedCalendarBusy={showImportedCalendarBusy}
        />

        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            display: 'flex',
            gap: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <NERFailButton sx={{ flex: 1 }} onClick={onCancel}>
            CANCEL
          </NERFailButton>
          <NERSuccessButton sx={{ flex: 1 }} onClick={onSubmit}>
            SAVE
          </NERSuccessButton>
        </Box>
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
        showImportedCalendarBusy={showImportedCalendarBusy}
      />
    </NERModal>
  );
};
export default AvailabilityEditModal;
