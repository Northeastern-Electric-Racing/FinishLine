import { useForm } from 'react-hook-form';
import NERFormModal from '../../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText, Grid } from '@mui/material';
import ReactHookTextField from '../../../../components/ReactHookTextField';
import { useToast } from '../../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FrequentlyAskedQuestion } from 'shared';
import useFormPersist from 'react-hook-form-persist';
import { useEffect } from 'react';

interface PartReviewFAQFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: FrequentlyAskedQuestion;
  onSubmit: (data: { question: string; answer: string }) => Promise<void>;
}

const schema = yup.object().shape({
  question: yup.string().required('Question is required'),
  answer: yup.string().required('Answer is required')
});

const PartReviewFAQFormModal = ({ open, handleClose, defaultValues, onSubmit }: PartReviewFAQFormModalProps) => {
  const toast = useToast();
  const creatingNew = defaultValues === undefined;

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      question: defaultValues?.question ?? '',
      answer: defaultValues?.answer ?? ''
    }
  });

  const formStorageKey = creatingNew ? 'create-part-review-faq' : 'edit-part-review-faq';

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  useEffect(() => {
    reset({
      question: defaultValues?.question ?? '',
      answer: defaultValues?.answer ?? ''
    });
  }, [defaultValues, reset]);

  const handleCancel = () => {
    reset({ question: '', answer: '' });
    sessionStorage.removeItem(formStorageKey);
    handleClose();
  };

  const onFormSubmit = async (data: { question: string; answer: string }) => {
    try {
      await onSubmit(data);
      toast.success(creatingNew ? 'FAQ created successfully' : 'FAQ updated successfully');
      handleClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
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
            <ReactHookTextField name="question" control={control} sx={{ width: 1 }} placeholder="Write the question here" />
            <FormHelperText error>{errors.question?.message}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <FormLabel>Answer</FormLabel>
            <ReactHookTextField name="answer" control={control} placeholder="Write the answer here" />
            <FormHelperText error>{errors.answer?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </NERFormModal>
  );
};

export default PartReviewFAQFormModal;
