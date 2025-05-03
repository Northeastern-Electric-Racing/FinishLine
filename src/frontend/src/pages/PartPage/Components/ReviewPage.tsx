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
import { useEditPartReview } from '../../../hooks/part-review.hooks';
import { PartSubmission, Review_Status } from 'shared/src/types/part-review.types';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DownloadButton from '../../../components/DownloadButton';

interface ReviewSidebarProps {
  submission: PartSubmission;
  reviewIndex: number;
}

const ReviewSidebar: React.FC<ReviewSidebarProps> = ({ submission, reviewIndex }) => {
  const [notes, setNotes] = useState(submission.reviews[reviewIndex].notes ?? '');
  const { mutateAsync: updateReview } = useEditPartReview();

  //Produces array of strings to be shown as bullet points on review that show number of markups on each file
  const markupsStrs = () => {
    const detailsStrs: string[] = [];

    for (let i = 0; i < submission.fileIds.length; i++) {
      const numOnPage = submission.reviews[reviewIndex].popUps.filter((popup) => popup.fileIndex === i).length;
      if (numOnPage > 0) {
        detailsStrs.push(
          `${submission.reviews[reviewIndex].popUps.filter((popup) => popup.fileIndex === i).length} comment${numOnPage !== 1 ? 's' : ''} left on Page ${i + 1}`
        );
      }
    }
    return detailsStrs;
  };

  //curried onSubmit for different buttons to submit with different status
  const onFormSubmit = (status: Review_Status) => {
    return () => {
      updateReview({
        partReviewId: submission.reviews[reviewIndex].partReviewId,
        notes,
        status,
        fileIds: submission.reviews[reviewIndex].fileIds
      });
    };
  };

  //deletes file in db
  const handleDeleteFile = (fileIdToDelete: string) => {
    updateReview({
      partReviewId: submission.reviews[reviewIndex].partReviewId,
      notes: submission.reviews[reviewIndex].notes,
      status: Review_Status.IN_PROGRESS,
      fileIds: submission.reviews[reviewIndex].fileIds.filter((id) => id !== fileIdToDelete)
    });
  };

  return (
    <Box display="flex" width={'100%'} flexDirection="column" gap={2} p={2}>
      {/* TOP BUTTONS */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button
          onClick={onFormSubmit(Review_Status.IN_PROGRESS)}
          sx={{
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
        <NERSuccessButton onClick={onFormSubmit(Review_Status.REVIEWED)}>Request Changes</NERSuccessButton>
        <Button
          onClick={onFormSubmit(Review_Status.APPROVED)}
          sx={{
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
              {submission.reviews[reviewIndex].fileIds.length ? (
                submission.reviews[reviewIndex].fileIds.map((fileId, index) => (
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
    </Box>
  );
};

export default ReviewSidebar;
