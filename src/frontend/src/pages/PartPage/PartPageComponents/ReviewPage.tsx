import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Grid,
  Tooltip,
  Button,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { useDeletePartReview, useEditPartReview } from '../../../hooks/part-review.hooks';
import { PartReview, PartSubmission, Review_Status } from 'shared/src/types/part-review.types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DownloadButton from '../../../components/DownloadButton';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';

interface ReviewSidebarProps {
  submission: PartSubmission;
  review: PartReview;
}

const ReviewSidebar: React.FC<ReviewSidebarProps> = ({ submission, review }) => {
  const toast = useToast();
  const [notes, setNotes] = useState(review.notes ?? '');
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const { mutateAsync: updateReview } = useEditPartReview();
  const { mutateAsync: deleteReview } = useDeletePartReview();

  //Produces array of strings to be shown as bullet points on review that show number of markups on each file
  const markupsStrs = () => {
    const detailsStrs: string[] = [];

    for (let i = 0; i < submission.fileIds.length; i++) {
      const numOnPage = review.popUps.filter((popup) => popup.fileIndex === i).length;
      if (numOnPage > 0) {
        detailsStrs.push(
          `${review.popUps.filter((popup) => popup.fileIndex === i).length} comment${numOnPage !== 1 ? 's' : ''} left on Page ${i + 1}`
        );
      }
    }
    return detailsStrs;
  };

  //curried onSubmit for different buttons to submit with different status
  const onFormSubmit = (status: Review_Status) => {
    return async () => {
      try {
        await updateReview({
          partReviewId: review.partReviewId,
          notes,
          status,
          fileIds: review.fileIds
        });
        switch (status) {
          case Review_Status.IN_PROGRESS:
            toast.success('Draft saved successfully!');
            break;
          case Review_Status.REVIEWED:
            toast.success('Changes requested successfully!');
            break;
          case Review_Status.APPROVED:
            toast.success('Submission approved successfully!');
            break;
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      }
    };
  };

  //deletes file in db
  const handleDeleteFile = (fileIdToDelete: string) => {
    updateReview({
      partReviewId: review.partReviewId,
      notes: review.notes,
      status: Review_Status.IN_PROGRESS,
      fileIds: review.fileIds.filter((id) => id !== fileIdToDelete)
    });
  };

  return (
    <Box display="flex" width={'100%'} flexDirection="column" gap={2} p={2}>
      <NERDeleteModal
        open={showConfirmDeleteModal}
        onHide={() => setShowConfirmDeleteModal(false)}
        dataType={`Part Review`}
        onFormSubmit={() => {
          deleteReview(review.partReviewId);
        }}
      />
      {/* TOP BUTTONS */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          onClick={onFormSubmit(Review_Status.IN_PROGRESS)}
          sx={{
            minWidth: '5rem',
            variant: 'contained',
            textTransform: 'none',
            fontSize: 16,
            borderColor: '#ef4345',
            backgroundColor: '#999999',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#7A7A7A',
              color: 'white'
            }
          }}
        >
          SAVE AS DRAFT
        </Button>
        <NERSuccessButton onClick={onFormSubmit(Review_Status.REVIEWED)} sx={{ minWidth: '5rem' }}>
          Request Changes
        </NERSuccessButton>
        <Button
          onClick={onFormSubmit(Review_Status.APPROVED)}
          sx={{
            minWidth: '5rem',
            variant: 'contained',
            textTransform: 'none',
            fontSize: 16,
            borderColor: '#ef4345',
            backgroundColor: '#D633FF',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#B01ADD',
              color: 'white'
            }
          }}
        >
          APPROVE
        </Button>
      </Box>
      <Divider />

      {/* SUBMISSION SELECTOR */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          Selected Submission
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mt={1}>
          <DownloadButton fileId={submission.fileIds[0]} filename={submission.name} />
          <Typography variant={'h4'}>{submission.name}</Typography>
        </Box>
      </Box>

      <Divider />

      {/* REVIEW STATUS */}
      <Box width={'100%'}>
        <Grid container display={'flex'} flexDirection={'row'} mb={2} xs={12}>
          <Typography variant="h5" fontWeight="medium">
            Review Status
          </Typography>
          <Tooltip title="To submit a review, add at least one of a submission markup, a file, or notes" arrow>
            <IconButton size="small">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid container display={'flex'} flexDirection={'row'} justifyContent="space-between" xs={12}>
          <Grid item>
            <Typography variant="body2" sx={{ mb: 0 }}>
              In-App Markups: {markupsStrs().length === 0 ? 'None' : ''}
            </Typography>
            <List sx={{ mt: 0, pl: 2 }}>
              {markupsStrs().map((line: string, index: number) => (
                <ListItem key={index} sx={{ display: 'list-item', p: 0 }}>
                  <ListItemText primary={<Typography variant="body2">{line}</Typography>} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item>
            <Typography variant="body2">File(s) Uploaded:</Typography>

            <Stack direction="column" spacing={1} mt={1}>
              {review.fileIds.length > 0 ? (
                review.fileIds.map((fileId, index) => (
                  <Box key={fileId} display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">{`File #${index + 1}`}</Typography>
                    <DownloadButton fileId={fileId} filename={`Review_File${index + 1}`} />
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
          </Grid>
        </Grid>
      </Box>

      <Divider />

      {/* REVIEWER NOTES */}
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          Reviewer's Notes
        </Typography>
        <TextField
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          placeholder="Any additional comments go here..."
          multiline
          rows={4}
        />
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          onClick={() => setShowConfirmDeleteModal(true)}
          sx={{
            variant: 'contained',
            textTransform: 'none',
            fontSize: 16,
            borderColor: '#ef4345',
            backgroundColor: '#ef4345',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: '#c62828',
              color: 'white'
            }
          }}
        >
          DELETE REVIEW
        </Button>
      </Box>
    </Box>
  );
};

export default ReviewSidebar;
