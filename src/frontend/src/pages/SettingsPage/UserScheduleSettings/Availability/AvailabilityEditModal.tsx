import { Availability } from 'shared';
import NERModal from '../../../../components/NERModal';
import EditAvailability from './EditAvailability';
import { Box, useMediaQuery } from '@mui/system';
import { Typography } from '@mui/material';
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

  if (isMobile && open) {
    return (
      <PageLayout title="Edit Availability" hidePageTitle>
        {/* the page title styling is far too large for this header sentence on a phone */}
        <Typography variant="h6" sx={{ fontSize: 18, mt: 2, mb: 1.5 }}>
          {header}
        </Typography>
        {/* leaves room for the fixed action bar below, which would otherwise cover the last row of slots */}
        <Box sx={{ pb: 'calc(72px + env(safe-area-inset-bottom))' }}>
          <EditAvailability
            editedAvailabilities={confirmedAvailabilities}
            setEditedAvailabilities={setConfirmedAvailabilities}
            totalAvailabilities={totalAvailabilities}
            canChangeDateRange={canChangeDateRange}
            initialDate={initialDate}
          />
        </Box>

        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            px: 2,
            pt: 2,
            pb: 'calc(16px + env(safe-area-inset-bottom))',
            display: 'flex',
            gap: 2,
            zIndex: 1100, // MUI's app bar layer - keeps the action bar above the grid
            borderTop: '1px solid',
            borderColor: 'divider',
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
      />
    </NERModal>
  );
};
export default AvailabilityEditModal;
