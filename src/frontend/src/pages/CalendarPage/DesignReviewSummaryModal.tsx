import { DesignReview, DesignReviewStatus } from 'shared';
import NERModal from '../../components/NERModal';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import { DesignReviewDelayModal } from './SummaryComponents/DesignReviewDelayModal';
import StageGateWorkPackageModalContainer from '../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import DesignReviewSummaryModalDetails from './SummaryComponents/DesignReviewSummaryModalDetails';
import DesignReviewSummaryModalCheckBox from './SummaryComponents/DesignReviewSummaryCheckbox';
import DesignReviewSummaryModalButtons from './SummaryComponents/DesignReviewSummaryModalButtons';
import DesignReviewSummaryModalAttendees from './SummaryComponents/DesignReviewSummaryModalAttendees';
import { getTeamTypeIcon } from './CalendarComponents/CalendarDayCard';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { DesignReviewAttendeeModal } from './DesignReviewAttendeeModal';
import { useCurrentUser } from '../../hooks/users.hooks';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../../hooks/toasts.hooks';
import { useDeleteDesignReview } from '../../hooks/design-reviews.hooks';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  const user = useCurrentUser();
  const toast = useToast();
  const history = useHistory();
  const [checked, setChecked] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: deleteDesignReview } = useDeleteDesignReview(designReview.designReviewId);

  const isScheduled =
    designReview.status === DesignReviewStatus.SCHEDULED || designReview.status === DesignReviewStatus.DONE;

  const handleDelete = () => {
    try {
      deleteDesignReview();
      history.push(routes.CALENDAR);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this design review?</Typography>
      </NERModal>
    );
  };

  return designReview.status === DesignReviewStatus.UNCONFIRMED ? (
    <DesignReviewAttendeeModal open={open} onHide={onHide} designReview={designReview} />
  ) : (
    <NERModal
      open={open}
      onHide={onHide}
      title={`Design Review`}
      hideFormButtons
      icon={getTeamTypeIcon(designReview.teamType.teamTypeId, true)}
      hideBackDrop
      showCloseButton
    >
      <Box minWidth="500px">
        <DeleteModal />
        {user.userId === designReview.userCreated.userId && (
          <Box position="absolute" right="52px" top="12px">
            <IconButton component={RouterLink} to={`${routes.CALENDAR}/${designReview.designReviewId}`}>
              <DeleteIcon />
            </IconButton>
            <IconButton component={RouterLink} to={`${routes.CALENDAR}/${designReview.designReviewId}`}>
              <EditIcon />
            </IconButton>
          </Box>
        )}
        <StageGateWorkPackageModalContainer
          wbsNum={designReview.wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
          hideStatus
        />
        <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />
        <Box>
          <Box display={'flex'} alignItems={'center'}>
            <Typography flexGrow={1} variant="h3" fontSize={30}>
              {`${designReview.wbsName}`}
            </Typography>
            <Chip
              size="small"
              label={designReview.status}
              variant="filled"
              sx={{
                fontSize: 12,
                color: 'white',
                width: 100
              }}
            />
          </Box>
          {isScheduled && <DesignReviewSummaryModalDetails designReview={designReview} />}
          {designReview.status === DesignReviewStatus.CONFIRMED && (
            <DesignReviewSummaryModalAttendees designReview={designReview} />
          )}
          {isScheduled && (
            <DesignReviewSummaryModalCheckBox
              onChange={(checked) => {
                setChecked(checked);
              }}
              checked={checked}
            />
          )}
          {isScheduled && (
            <DesignReviewSummaryModalButtons
              designReview={designReview}
              handleStageGateClick={() => setShowStageGateModal(true)}
              handleDelayClick={() => setShowDelayModal(true)}
              checked={checked}
            />
          )}
        </Box>
      </Box>
    </NERModal>
  );
};

export default DRCSummaryModal;
