import { DesignReview, DesignReviewStatus, TeamType, isAdmin } from 'shared';
import NERModal from '../../components/NERModal';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';
import DesignReviewSummaryModalDetails from './SummaryComponents/DesignReviewSummaryModalDetails';
import DesignReviewSummaryModalAttendees from './SummaryComponents/DesignReviewSummaryModalAttendees';
import { getTeamTypeIcon } from './CalendarComponents/CalendarDayCard';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import { useCurrentUser } from '../../hooks/users.hooks';
import DeleteIcon from '@mui/icons-material/Delete';
import { useToast } from '../../hooks/toasts.hooks';
import { useDeleteDesignReview } from '../../hooks/design-reviews.hooks';
import { designReviewStatusColor, designReviewStatusPipe } from '../../utils/design-review.utils';
import NERSuccessButton from '../../components/NERSuccessButton';
import { DesignReviewAvailabilityInfo } from './DesignReviewAvailabilityInfo';
import { CheckCircle } from '@mui/icons-material';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
  teamTypes: TeamType[];
  markedStatus?: DesignReviewStatus;
  setMarkedStatus?: (_: DesignReviewStatus) => void;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({
  open,
  onHide,
  designReview,
  teamTypes,
  markedStatus = DesignReviewStatus.UNCONFIRMED,
  setMarkedStatus = () => {}
}: DRCSummaryModalProps) => {
  const user = useCurrentUser();
  const toast = useToast();
  const history = useHistory();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: deleteDesignReview } = useDeleteDesignReview(designReview.designReviewId);

  const isDesignReviewCreator = user.userId === designReview.userCreated.userId;

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

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={`Design Review`}
      hideFormButtons
      icon={getTeamTypeIcon(designReview.teamType.teamTypeId, true)}
      hideBackDrop
      showCloseButton
      titleChildren={
        <Box position="absolute" right="52px" top="12px">
          {(isDesignReviewCreator || isAdmin(user.role)) && (
            <>
              <IconButton onClick={() => setShowDeleteModal(true)}>
                <DeleteIcon />
              </IconButton>
              <IconButton component={RouterLink} to={`${routes.CALENDAR}/${designReview.designReviewId}`}>
                <EditIcon />
              </IconButton>
            </>
          )}
          <IconButton
            component={RouterLink}
            to={`${routes.SETTINGS_PREFERENCES}?drId=${designReview.designReviewId}`}
            disabled={
              !designReview.requiredMembers
                .concat(designReview.optionalMembers)
                .some((attendee) => attendee.userId === user.userId) || isScheduled
            }
          >
            <CheckCircle />
          </IconButton>
        </Box>
      }
    >
      <Box minWidth="550px">
        <DeleteModal />

        <Box>
          <Box display={'flex'} alignItems={'center'}>
            <Typography flexGrow={1} variant="h4">
              {`${designReview.wbsName}`}
            </Typography>
            <Chip
              size="small"
              label={designReviewStatusPipe(markedStatus)}
              variant="filled"
              sx={{
                backgroundColor: designReviewStatusColor(markedStatus),
                fontSize: 14,
                color: 'white',
                width: 150,
                fontWeight: 'bold'
              }}
            />
          </Box>
          {isScheduled && (
            <DesignReviewSummaryModalDetails
              designReview={designReview}
              teamTypes={teamTypes}
              markedStatus={markedStatus}
              setMarkedStatus={setMarkedStatus}
            />
          )}
          {designReview.status === DesignReviewStatus.CONFIRMED && (
            <Box>
              <DesignReviewSummaryModalAttendees designReview={designReview} />
              {isDesignReviewCreator && (
                <Box display="flex" justifyContent={'end'}>
                  <NERSuccessButton component={RouterLink} to={`${routes.CALENDAR}/${designReview.designReviewId}`}>
                    Schedule Design Review
                  </NERSuccessButton>
                </Box>
              )}
            </Box>
          )}
          {designReview.status === DesignReviewStatus.UNCONFIRMED && (
            <DesignReviewAvailabilityInfo designReview={designReview} />
          )}
        </Box>
      </Box>
    </NERModal>
  );
};

export default DRCSummaryModal;
