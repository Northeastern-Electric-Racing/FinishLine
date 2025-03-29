import { useForm } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Grid } from '@mui/material';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FrequentlyAskedQuestion } from 'shared';

interface PartReviewFAQFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: FrequentlyAskedQuestion;
  onSubmit: (data: { question: string; answer: string }) => void;
}

const PartReviewFAQFormModal = ({ open, handleClose, defaultValues, onSubmit }: PartReviewFAQFormModalProps) => {
  const toast = useToast();
  const creatingNew = defaultValues === undefined;

  const schema = yup.object().shape({
    question: yup.string().required('Question is required'),
    answer: yup.string().required('Answer is required')
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      question: defaultValues?.question ?? '',
      answer: defaultValues?.answer ?? ''
    }
  });

  const onFormSubmit = async (data: { question: string; answer: string }) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleClose}
      title={creatingNew ? 'Create FAQ' : 'Edit FAQ'}
      reset={() => reset({ question: '', answer: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId={creatingNew ? 'create-faq-form' : 'edit-faq-form'}
      showCloseButton
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Question</FormLabel>
            <ReactHookTextField name="question" control={control} />
            <FormHelperText error>{errors.question?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Answer</FormLabel>
            <ReactHookTextField name="answer" control={control} multiline rows={3} />
            <FormHelperText error>{errors.answer?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default PartReviewFAQFormModal;
