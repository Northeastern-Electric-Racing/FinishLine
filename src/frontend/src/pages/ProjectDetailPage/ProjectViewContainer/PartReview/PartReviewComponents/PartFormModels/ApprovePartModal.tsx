import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Grid, FormControl, FormLabel, FormHelperText } from '@mui/material';
import * as yup from 'yup';
import { Review_Status, Part, PartReview } from 'shared';
import { useToast } from '../../../../../../hooks/toasts.hooks';
import { useEditPartReview } from '../../../../../../hooks/part-review.hooks';
import NERFormModal from '../../../../../../components/NERFormModal';
import ReactHookTextField from '../../../../../../components/ReactHookTextField';

interface ApprovePartModalProps {
  open: boolean;
  handleClose: () => void;
  review: PartReview;
}

const schema = yup.object().shape({
  notes: yup.string().optional()
});

const ApprovePartModal = ({ open, handleClose, review }: ApprovePartModalProps) => {
  const toast = useToast();
  const { mutateAsync: updateReview } = useEditPartReview();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<{ notes?: string }>({
    resolver: yupResolver(schema)
  });

  const onFormSubmit = async (data: { notes?: string }) => {
    try {
      await updateReview({
        partReviewId: review.partReviewId,
        notes: data.notes,
        status: Review_Status.APPROVED,
        fileIds: review.fileIds
      });

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
      onFormSubmit={onFormSubmit}
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
