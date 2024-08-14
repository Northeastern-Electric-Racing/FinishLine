import { useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { FormControl, FormLabel, FormHelperText } from '@mui/material';
import ReactHookTextField from '../../../components/ReactHookTextField';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box } from '@mui/system';
import useFormPersist from 'react-hook-form-persist';
import { FormStorageKey } from '../../../utils/form';
import { FaqPayload } from '../../../hooks/recruitment.hooks';
import { FrequentlyAskedQuestion } from 'shared/src/types/frequently-asked-questions-types';

interface FaqFormModalProps {
  open: boolean;
  handleClose: () => void;
  defaultValues?: FrequentlyAskedQuestion;
  onSubmit: (data: FaqPayload) => Promise<FrequentlyAskedQuestion>;
}

const schema = yup.object().shape({
  question: yup.string().required('Question is Required'),
  answer: yup.string().required('Answer is Required')
});

const FaqFormModal: React.FC<FaqFormModalProps> = ({ open, handleClose, defaultValues, onSubmit }) => {
  const onFormSubmit = async (data: FaqPayload) => {
    await onSubmit(data);
    handleClose();
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      question: defaultValues?.question ?? '',
      answer: defaultValues?.answer ?? ''
    }
  });

  const formStorageKey = defaultValues ? FormStorageKey.EDIT_FAQ : FormStorageKey.CREATE_FAQ;

  useFormPersist(formStorageKey, {
    watch,
    setValue
  });

  const handleCancel = () => {
    reset({ question: '', answer: '' });
    sessionStorage.removeItem(formStorageKey);
    handleClose();
  };

  return (
    <NERFormModal
      open={open}
      onHide={handleCancel}
      title={defaultValues ? 'Edit Faq' : 'New Faq'}
      reset={() => reset({ question: '', answer: '' })}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onFormSubmit}
      formId="faq-form"
      showCloseButton
    >
      <FormControl fullWidth>
        <FormLabel>Question*</FormLabel>
        <ReactHookTextField name="question" control={control} sx={{ width: 1 }} placeholder="Write the question here" />
        <FormHelperText error>{errors.question?.message}</FormHelperText>
      </FormControl>
      <FormControl fullWidth>
        <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
          <FormLabel>Answer*</FormLabel>
        </Box>
        <ReactHookTextField name="answer" control={control} placeholder="Write the answer here." />
        <FormHelperText error>{errors.answer?.message}</FormHelperText>
      </FormControl>
    </NERFormModal>
  );
};

export default FaqFormModal;
