import Edit from '@mui/icons-material/Edit';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import { Part, Review_Status, RoleEnum, WbsNumber, isAtLeastRank, isNotLeadership, wbsPipe } from 'shared';
import { AddPhotoAlternateOutlined, Check, Collections, EditNote } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CreateSubmissionModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/CreateSubmissionModal';
import SubmissionFormModal from '../../ProjectDetailPage/ProjectViewContainer/PartReview/PartReviewComponents/PartFormModels/SubmissionFormModal';
import {
  useCreatePartReview,
  useDeletePart,
  useEditPart,
  useEditPartSubmission,
  usePartsFromProject,
  useUploadPreviewImage
} from '../../../hooks/part-review.hooks';
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
  reviewIndex: number;
  wbsNum: WbsNumber;
}

const PartActionsMenu: React.FC<PartActionsMenuProps> = ({
  part,
  submissionIndex,
  reviewIndex,
  wbsNum
}: PartActionsMenuProps) => {
  const user = useCurrentUser();
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const [showEditPart, setShowEditPart] = useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [showEditSubmission, setShowEditSubmission] = useState(false);
  const [showApproveSubmission, setShowApproveSubmission] = useState(false);
  const [showDeletePart, setShowDeletePart] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUploading, setPreviewUploading] = useState(false);

  const { mutateAsync: editPart } = useEditPart(part.partId);
  const { mutateAsync: deletePart } = useDeletePart(part.partId);
  const { mutateAsync: createReview } = useCreatePartReview();
  const { mutateAsync: uploadPreviewImage } = useUploadPreviewImage(part.partId);

  const {
    data: partsInProject,
    isLoading: partsLoading,
    isError: partsIsError,
    error: partsError
  } = usePartsFromProject(wbsPipe(wbsNum));

  const submission = part.submissions[submissionIndex];
  const { mutateAsync: editSubmission } = useEditPartSubmission(submission ? submission.partSubmissionId : '');

  const onSubmitEditSubmission = async (data: { name: string; notes?: string; fileIds: string[] }) => {
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

  const startReview = async (submission: { partSubmissionId: string; fileIds: string[] }) => {
    if (!submission) {
      toast.error('No submission found.');
      return;
    }

    await createReview({
      submissionId: submission.partSubmissionId,
      status: Review_Status.IN_REVIEW,
      fileIds: submission.fileIds
    });

    const reviewLink =
      location.pathname +
      `?submissionIndex=${submissionIndex}&` +
      'reviewIndex=' +
      (reviewIndex === -1 ? '0' : `${reviewIndex}`);
    history.push(reviewLink);
  };

  const latestReview =
    submission?.reviews && submission.reviews.length > 0
      ? [...submission.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
      : null;

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

  const handleUploadPreview = () => {
    fileInputRef.current?.click();
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
      disabled:
        !isAtLeastRank(RoleEnum.MEMBER, user.role) ||
        !submission ||
        submission.reviews.length !== 0 ||
        submission.userCreated.userId !== user.userId
    },
    {
      title: 'Review',
      onClick: () => startReview(submission),
      icon: <EditNote />,
      disabled: !isUserAReviewer(user.userId, part) || part.submissions.length === 0
    },
    {
      title: 'Approve',
      onClick: () => setShowApproveSubmission(true),
      icon: <Check />,
      disabled: !isUserAReviewer(user.userId, part) || part.submissions.length === 0
    },
    {
      title: 'Delete',
      onClick: () => setShowDeletePart(true),
      icon: <DeleteIcon />,
      disabled: isNotLeadership(user.role)
    },
    {
      title: 'Upload Preview Image',
      onClick: () => handleUploadPreview(),
      icon: <AddPhotoAlternateOutlined />,
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
        onSubmit={onSubmitEditSubmission}
        partsInProject={partsInProject}
      />
      {latestReview && (
        <ApprovePartModal
          open={showApproveSubmission}
          handleClose={() => setShowApproveSubmission(false)}
          part={part}
          review={latestReview}
          wbsNum={wbsPipe(wbsNum)}
        />
      )}
      <DeleteModal />
      {/* for preview image upload button */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          if (file.size > 5 * 1024 * 1024) {
            toast.error('Preview image must be less than 5MB');
            return;
          }

          if (!/^[\w.]+$/.test(file.name)) {
            toast.error('File name can only contain letters, numbers, underscores, and dots');
            return;
          }

          if (file.name.length > 20) {
            toast.error('File name must be 20 characters or less');
            return;
          }

          setPreviewUploading(true);
          try {
            await uploadPreviewImage(file);
            toast.success('Preview image uploaded successfully!');
          } catch (err: unknown) {
            toast.error('Failed to upload preview image');
          }
          setPreviewUploading(false);
        }}
      />
    </>
  );
};

export default PartActionsMenu;
