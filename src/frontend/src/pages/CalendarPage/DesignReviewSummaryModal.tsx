import { DesignReview } from 'shared';
import NERModal from '../../components/NERModal';
import { Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import { DesignReviewDelayModal } from './SummaryComponents/DesignReviewDelayModal';
import StageGateWorkPackageModalContainer from '../WorkPackageDetailPage/StageGateWorkPackageModalContainer/StageGateWorkPackageModalContainer';
import DesignReviewSummaryModalDetails from './SummaryComponents/DesignReviewSummaryModalDetails';
import DesignReviewSummaryModalCheckBox from './SummaryComponents/DesignReviewSummaryCheckbox';
import DesignReviewSummaryModalButtons from './SummaryComponents/DesignReviewSummaryModalButtons';
import DesignReviewSummaryModalAttendees from './SummaryComponents/DesignReviewSummaryModalAttendees';
import { getTeamTypeIcon } from './CalendarComponents/CalendarDayCard';
import { useEditDesignReview } from '../../hooks/design-reviews.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

const DRCSummaryModal: React.FC<DRCSummaryModalProps> = ({ open, onHide, designReview }) => {
  const [checked, setChecked] = useState<boolean>(false);
  const [showStageGateModal, setShowStageGateModal] = useState<boolean>(false);
  const [showDelayModal, setShowDelayModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const toast = useToast();

  const {
    isLoading: editDesignReviewIsLoading,
    mutateAsync: editDesignReview,
    isError: editDesignReviewIsError,
    error: editDesignReviewError
  } = useEditDesignReview(designReview.designReviewId);

  const onSave = async () => {
    setEditing(false);
    try {
      await editDesignReview({
        ...designReview,
        zoomLink: designReview.zoomLink ?? '',
        location: designReview.location ?? '',
        docTemplateLink: designReview.docTemplateLink ?? '',
        teamTypeId: designReview.teamType.teamTypeId,
        attendees: designReview.attendees.map((user) => user.userId),
        requiredMembersIds: designReview.requiredMembers.map((member) => member.userId),
        optionalMembersIds: designReview.optionalMembers.map((member) => member.userId)
      });
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  if (!designReview || editDesignReviewIsLoading) return <LoadingIndicator />;
  if (editDesignReviewIsError) return <ErrorPage error={editDesignReviewError!} message={editDesignReviewError?.message} />;

  return (
    <NERModal
      open={open}
      onHide={onHide}
      title={designReview.wbsName}
      hideFormButtons
      icon={getTeamTypeIcon(designReview.teamType.teamTypeId, true)}
    >
      <Box minWidth="500px">
        <Box position="absolute" right="16px" top="12px">
          {editing ? (
            <IconButton onClick={onSave}>
              <SaveIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditing(true)}>
              <EditIcon />
            </IconButton>
          )}
        </Box>
        <StageGateWorkPackageModalContainer
          wbsNum={designReview.wbsNum}
          modalShow={showStageGateModal}
          handleClose={() => setShowStageGateModal(false)}
          hideStatus
        />
        <DesignReviewDelayModal open={showDelayModal} onHide={() => setShowDelayModal(false)} designReview={designReview} />
        <Box>
          <DesignReviewSummaryModalDetails designReview={designReview} isEditing={editing} />
          <DesignReviewSummaryModalAttendees designReview={designReview} />
          <DesignReviewSummaryModalCheckBox
            onChange={(checked) => {
              setChecked(checked);
            }}
            checked={checked}
          />
          <DesignReviewSummaryModalButtons
            designReview={designReview}
            handleStageGateClick={() => setShowStageGateModal(true)}
            handleDelayClick={() => setShowDelayModal(true)}
            checked={checked}
          />
        </Box>
      </Box>
    </NERModal>
  );
};

export default DRCSummaryModal;
