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
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';

interface DRCSummaryModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

export interface DesignReviewEditProps {
  zoomLink: string;
  location: string;
  docTemplateLink: string;
}

const schema = yup.object().shape({
  zoomLink: yup
    .string()
    .optional()
    .test('zoom-link', 'Must be a valid zoom link', (value) => value!.includes('zoom.us/')),
  location: yup.string().optional(),
  docTemplateLink: yup.string().optional()
});

/*
  status: DesignReviewStatus;
  attendees: number[];
  meetingTimes: number[];
 */

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

  const onSave = async (payload: DesignReviewEditProps) => {
    setEditing(false);
    try {
      await editDesignReview({
        ...designReview,
        zoomLink: payload.zoomLink ?? designReview.zoomLink,
        location: payload.location ?? designReview.location,
        docTemplateLink: payload.docTemplateLink ?? designReview.docTemplateLink,
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

  const {
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<DesignReviewEditProps>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...designReview,
      zoomLink: designReview.zoomLink ?? '',
      location: designReview.location ?? '',
      docTemplateLink: designReview.docTemplateLink ?? ''
    }
  });

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
      <form id={'design-reviews-edit-form'} onSubmit={handleSubmit(onSave)}>
        <Box minWidth="500px">
          <Box position="absolute" right="16px" top="12px">
            {editing ? (
              <>
                <IconButton type="submit" form="design-reviews-edit-form">
                  <SaveIcon />
                </IconButton>
              </>
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
          <DesignReviewDelayModal
            open={showDelayModal}
            onHide={() => setShowDelayModal(false)}
            designReview={designReview}
          />
          <Box>
            <DesignReviewSummaryModalDetails
              designReview={designReview}
              isEditing={editing}
              control={control}
              errors={errors}
            />
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
      </form>
    </NERModal>
  );
};

export default DRCSummaryModal;
