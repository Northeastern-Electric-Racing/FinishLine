import Edit from '@mui/icons-material/Edit';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import { Part, PartSubmission, RoleEnum, WbsNumber, isAtLeastRank, isNotLeadership, wbsPipe } from 'shared';
import { Check, Collections, EditNote } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import CreateSubmissionModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/CreateSubmissionModal';
import SubmissionFormModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/SubmissionFormModal';
import { useDeletePart, useEditPart, useEditPartSubmission, usePartsFromProject } from '../../../hooks/part-review.hooks';
import PartFormModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/PartFormModal';
import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import { useToast } from '../../../hooks/toasts.hooks';
import ApprovePartModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/ApprovePartModal';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface PartActionsMenuProps {
  part: Part;
  submissionIndex: number;
  wbsNum: WbsNumber;
}

const PartActionsMenu: React.FC<PartActionsMenuProps> = ({ part, submissionIndex, wbsNum }: PartActionsMenuProps) => {
  const user = useCurrentUser();
  const history = useHistory();
  const toast = useToast();
  const [showEditPart, setShowEditPart] = useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [showEditSubmission, setShowEditSubmission] = useState(false);
  const [showApproveSubmission, setShowApproveSubmission] = useState(false);
  const [showDeletePart, setShowDeletePart] = useState(false);

  const { mutateAsync: editPart } = useEditPart(part.partId);
  const { mutateAsync: deletePart } = useDeletePart(part.partId);
  const {
    data: partsInProject,
    isLoading: partsLoading,
    isError: partsIsError,
    error: partsError
  } = usePartsFromProject(wbsPipe(wbsNum));

  const submission = part.submissions[submissionIndex];
  const { mutateAsync: editSubmission } = useEditPartSubmission(submission ? submission.partSubmissionId : '');

  const onSubmitSubmission = async (data: { name: string; notes?: string; fileIds: string[] }) => {
    if (!submission) {
      toast.error('No submission found.');
      return;
    }
    await editSubmission({
      name: data.name,
      notes: data.notes
    });
  };

  const handleDelete = async () => {
    try {
      await deletePart();
      history.goBack();
      toast.success(`${part.commonName} Deleted Successfully!`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  if (!partsInProject || partsLoading) return <LoadingIndicator />;
  if (partsIsError) return <ErrorPage message={partsError?.message} />;

  const isUserAReviewer = (userId: string, part: Part): boolean => {
    return part.reviewRequests.some((request) => request.reviewerRequested.userId === userId);
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeletePart}
        onHide={() => setShowDeletePart(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this part?</Typography>
      </NERModal>
    );
  };

  const buttons: ButtonInfo[] = [
    {
      title: 'Edit Part Details',
      onClick: () => setShowEditPart(true),
      icon: <Edit />,
      disabled: isNotLeadership(user.role)
    },
    {
      title: 'Upload Submission',
      onClick: () => setShowAddSubmission(true),
      icon: <Collections />,
      disabled: !isAtLeastRank(RoleEnum.MEMBER, user.role)
    },
    {
      title: 'Edit Submission',
      onClick: () => setShowEditSubmission(true),
      icon: <Edit />,
      disabled: !isAtLeastRank(RoleEnum.MEMBER, user.role) || !submission || submission.reviews.length === 0
    },
    {
      title: 'Review',
      onClick: () => history.push(`${routes}`), // not entirely sure what this route should be...
      icon: <EditNote />,
      disabled: !isUserAReviewer(user.userId, part) || part.submissions.length === 0
    },
    {
      title: 'Approve',
      onClick: () => setShowApproveSubmission(true),
      icon: <Check />,
      disabled: !isUserAReviewer(user.userId, part) // assuming we can approve a part without a submission
    },
    {
      title: 'Delete',
      onClick: () => setShowDeletePart(true),
      icon: <DeleteIcon />,
      disabled: isNotLeadership(user.role)
    }
  ];

  return (
    <>
      <ActionsMenu buttons={buttons} />
      <PartFormModal
        open={showEditPart}
        handleClose={() => setShowEditPart(false)}
        defaultValues={part}
        onSubmit={editPart}
        partsInProject={partsInProject}
        wbsNum={wbsNum}
      />
      <CreateSubmissionModal
        open={showAddSubmission}
        handleClose={() => setShowAddSubmission(false)}
        partsInProject={partsInProject}
      />
      <SubmissionFormModal
        open={showEditSubmission}
        handleClose={() => setShowEditSubmission(false)}
        defaultValues={submission}
        onSubmit={onSubmitSubmission}
        partsInProject={partsInProject}
      />
      <ApprovePartModal
        open={showApproveSubmission}
        handleClose={() => setShowApproveSubmission(false)}
        onSubmit={editPart}
        submissionsInPart={part.submissions}
      />
      <DeleteModal />
    </>
  );
};

export default PartActionsMenu;
