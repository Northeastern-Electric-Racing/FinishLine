import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, FormControl, FormLabel, FormHelperText } from '@mui/material';
import * as yup from 'yup';
import { Review_Status, Part, PartReview } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import { useEditPart, useEditPartReview } from '../../../../../../hooks/part-review.hooks';
import NERFormModal from '../../../../../../components/NERFormModal';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';

interface ApprovePartModalProps {
  open: boolean;
  handleClose: () => void;
  part: Part;
  review: PartReview;
  wbsNum: string;
}

const schema = yup.object().shape({
  notes: yup.string().optional()
});

const ApprovePartModal = ({ open, handleClose, part, review, wbsNum }: ApprovePartModalProps) => {
  const toast = useToast();
  const { mutateAsync: editPart } = useEditPart(part.partId);
  const { mutateAsync: editReview } = useEditPartReview();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<{ notes?: string }>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: { notes?: string }) => {
    try {
      await Promise.all([
        editPart({
          wbsNum: wbsNum,
          index: part.index,
          commonName: part.commonName,
          description: part.description,
          reviewStatus: Review_Status.APPROVED,
          tagIds: part.tags.map((tag) => tag.partTagId),
          assigneeIds: part.assignees.map((a) => a.userId),
          reviewerIds: part.reviewRequests.map((r) => r.reviewerRequested.userId)
        }),
        editReview({
          partReviewId: review.partReviewId,
          notes: data.notes
        })
      ]);

      toast.success('Part Approved!');
      handleClose();
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
    reset();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title="Approve Part"
      reset={() => reset()}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="approve-part-form"
      showCloseButton
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Reviewer Notes (optional)</FormLabel>
            <ReactHookTextField
              required={false}
              name="notes"
              control={control}
              multiline
              rows={3}
              placeholder="Any additional comments go here..."
            />
            <FormHelperText error>{errors.notes?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default ApprovePartModal;
