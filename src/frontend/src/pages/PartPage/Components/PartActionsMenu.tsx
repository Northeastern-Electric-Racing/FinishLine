import Edit from '@mui/icons-material/Edit';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import { Part, PartPreview, RoleEnum, WbsNumber, isAtLeastRank, isNotLeadership } from 'shared';
import { Check, Collections, EditNote } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import CreateSubmissionModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/CreateSubmissionModal';
import SubmissionFormModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/SubmissionFormModal';
import { useDeletePart, useEditPart, useEditPartSubmission, useUploadSubmissionFiles } from '../../../hooks/part-review.hooks';
import PartFormModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/PartFormModal';
import { Typography } from '@mui/material';
import NERModal from '../../../components/NERModal';
import Toast from '../../../components/Toast/Toast';
import { useToast } from '../../../hooks/toasts.hooks';

interface PartActionsMenuProps {
  part: Part;
  partsInProject: PartPreview[];
  wbsNum: WbsNumber;
}

const PartActionsMenu: React.FC<PartActionsMenuProps> = ({ part, partsInProject, wbsNum }: PartActionsMenuProps) => {
  const user = useCurrentUser();
  const history = useHistory();
  const toast = useToast();
  const [showEditPart, setShowEditPart] = useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [showEditSubmission, setShowEditSubmission] = useState(false);
  const [showApproveSubmission, setShowApproveSubmission] = useState(false);
  const [showDeletePart, setShowDeletePart] = useState(false);

  const { mutateAsync: editSubmission } = useEditPartSubmission();
  const { mutateAsync: uploadFiles } = useUploadSubmissionFiles();
  const { mutateAsync: editPart } = useEditPart(part.partId);
  const { mutateAsync: deletePart } = useDeletePart(part.partId);

  const onSubmitPart = async (data: {}) => {
    const editedPart = await editPart();
  };
  const onSubmitSubmission = async (data: {
    partId: string;
    name: string;
    notes?: string;
    files: { name: string; file: File }[];
  }) => {
    const submission = await editSubmission({
      partId: data.partId,
      name: data.name,
      notes: data.notes
    });

    await uploadFiles({
      submissionId: submission.partSubmissionId,
      files: data.files.map((file) => file.file)
    });
  };

  const handleDelete = async () => {
    try {
      await deletePart();
      history.push(routes.PROJECT_PART);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const isUserAReviewer = (userId: string, part: Part): boolean => {
    return part.reviewRequests.some(
      (request) => request.reviewerRequested.userId === userId
    );
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
      disabled: !isAtLeastRank(RoleEnum.MEMBER, user.role) && undefined
    },
    {
      title: 'Review',
      onClick: () => history.push(`${routes}`),
      icon: <EditNote />,
      disabled: !isUserAReviewer(user.userId, part);
    },
    {
      title: 'Approve',
      onClick: () => setShowApproveSubmission(true),
      icon: <Check />,
      disabled: undefined
    },
    {
      title: 'Delete',
      onClick: () => setShowDeletePart(true),
      icon: <DeleteIcon />,
      disabled: isNotLeadership(user.role)
    }
  ];

  return (
    <ActionsMenu buttons={buttons}>
      <PartFormModal
        open={showEditPart}
        handleClose={() => setShowEditPart(false)}
        defaultValues={part}
        onSubmit={onSubmitPart}
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
        defaultValues={undefined}
        onSubmit={onSubmitSubmission}
        partsInProject={partsInProject}
      />
      <DeleteModal />
    </ActionsMenu>
  );
};

export default PartActionsMenu;
