import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Box, Typography, Divider, Stack, IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import NERAutocomplete from '../../../components/NERAutocomplete';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useEditPartReview, useSinglePart } from '../../../hooks/part-review.hooks';
import { Review_Status } from 'shared/src/types/part-review.types';
import { ToastContext } from '../../../components/Toast/ToastProvider';
import { PartReview } from 'shared';
import { apiUrls } from '../../../utils/urls';

interface ReviewSidebarProps {
  wbsNum: string;
  index: number;
  reviewId: string;
}

const ReviewSidebar: React.FC<ReviewSidebarProps> = ({ wbsNum, index, reviewId }) => {
  const queryClient = useQueryClient();
  const { addToast } = useContext(ToastContext);

  const { control, handleSubmit, setValue } = useForm({ defaultValues: { notes: '' } });
  const { data: part, isLoading } = useSinglePart(wbsNum, index);
  const saveReview = useEditPartReview(reviewId);

  const [selectedSubmission, setSelectedSubmission] = useState<{ id: string; label: string } | null>(null);
  const [localFileIds, setLocalFileIds] = useState<string[]>([]);

  const allSubmissions = useMemo(() => part?.submissions ?? [], [part?.submissions]);
  const review: PartReview | undefined = allSubmissions.flatMap((s) => s.reviews).find((r) => r.partReviewId === reviewId);

  useEffect(() => {
    if (!review || !allSubmissions) return;

    const submission = allSubmissions.find((s) => s.partSubmissionId === review.submissionId);
    if (submission) {
      setSelectedSubmission({
        id: submission.partSubmissionId,
        label: submission.name || `Submission ${submission.partSubmissionId.slice(0, 4)}`
      });
    }

    setValue('notes', review.notes ?? '');
    setLocalFileIds(review.fileIds ?? []);
  }, [review, allSubmissions, setValue]);

  const submissionOptions = allSubmissions.map((sub) => ({
    id: sub.partSubmissionId,
    label: sub.name || `Submission ${sub.partSubmissionId.slice(0, 4)}`
  }));

  const onSubmit = handleSubmit((data) => {
    if (!selectedSubmission || !review) {
      addToast({ key: Date.now(), message: 'Please select a submission.', type: 'error' });
      return;
    }

    saveReview.mutate(
      {
        status: Review_Status.IN_REVIEW,
        notes: data.notes,
        fileIds: localFileIds
      },
      {
        onSuccess: () => {
          addToast({ key: Date.now(), message: 'Review saved as draft.', type: 'success' });
          queryClient.invalidateQueries(['parts']);
        },
        onError: () => {
          addToast({ key: Date.now(), message: 'Failed to save review.', type: 'error' });
        }
      }
    );
  });

  const onFinish = handleSubmit((data) => {
    if (!selectedSubmission || !review) {
      addToast({ key: Date.now(), message: 'Please select a submission.', type: 'error' });
      return;
    }

    saveReview.mutate(
      {
        status: Review_Status.REVIEWED,
        notes: data.notes,
        fileIds: localFileIds
      },
      {
        onSuccess: () => {
          addToast({ key: Date.now(), message: 'Review marked as complete.', type: 'success' });
          queryClient.invalidateQueries(['parts']);
        },
        onError: () => {
          addToast({ key: Date.now(), message: 'Failed to submit review.', type: 'error' });
        }
      }
    );
  });

  const handleDownloadFile = (fileId: string) => {
    const fileUrl = apiUrls.downloadFile(fileId);
    window.open(fileUrl, '_blank');
  };

  const handleDeleteFile = (fileIdToDelete: string) => {
    setLocalFileIds((prev) => prev.filter((id) => id !== fileIdToDelete));
  };

  if (isLoading || !review) return <Typography>Loading review...</Typography>;

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%" p={2}>
      {/* TOP BUTTONS */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <NERSuccessButton onClick={onSubmit} disabled={saveReview.isLoading}>
          Save as Draft
        </NERSuccessButton>
        <NERFailButton onClick={onFinish} disabled={saveReview.isLoading}>
          Finish Review
        </NERFailButton>
      </Box>

      {/* HEADER */}
      <Typography variant="h6" fontWeight="bold">
        Review for {part?.projectId}_{part?.commonName}_{part?.index.toString().padStart(5, '0')}
      </Typography>

      <Divider />

      {/* SUBMISSION SELECTOR */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          Selected Submission
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <IconButton
            onClick={() => selectedSubmission && handleDownloadFile(selectedSubmission.id)}
            disabled={!selectedSubmission}
            sx={{ border: '1px solid gray', borderRadius: '50%', p: 1 }}
          >
            <DownloadIcon />
          </IconButton>
          <Box flexGrow={1}>
            <NERAutocomplete
              id="submission-selector"
              options={submissionOptions}
              value={selectedSubmission}
              onChange={(_, value) => setSelectedSubmission(value)}
              size="medium"
              placeholder="Select a submission"
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* REVIEW STATUS */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          Review Status
        </Typography>
        <Typography variant="body2">In-App Markups: {review?.popUps?.length ?? 0}</Typography>
        <Typography variant="body2">Files Uploaded:</Typography>

        <Stack direction="column" spacing={1} mt={1}>
          {localFileIds.length ? (
            localFileIds.map((fileId) => (
              <Box key={fileId} display="flex" alignItems="center" gap={1}>
                <Typography variant="body2">{fileId}</Typography>
                <IconButton size="small" onClick={() => handleDownloadFile(fileId)}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDeleteFile(fileId)} sx={{ color: 'red' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No files uploaded yet.
            </Typography>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* REVIEWER NOTES */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          Reviewer’s Notes
        </Typography>
        <Controller
          name="notes"
          control={control}
          render={({ field }) => (
            <ReactHookTextField
              {...field}
              name="notes"
              control={control}
              fullWidth
              placeholder="Any additional comments go here..."
              multiline
              rows={4}
            />
          )}
        />
      </Box>

      <Divider />
    </Box>
  );
};

export default ReviewSidebar;
