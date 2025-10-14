import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl } from '@mui/material';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useSetSaboNumber } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

const schema = yup.object({
  saboNumber: yup
    .number()
    .typeError('The SABO number should be a valid number')
    .required('The SABO number is required')
    .test('exact-5-digits', 'The SABO number must be at least 5 digits', function () {
      const original = this.originalValue?.toString().trim();
      return /^\d{5,}$/.test(original || '');
    })
});

interface AddSABONumberModalProps {
  modalShow: boolean;
  onHide: () => void;
  reimbursementRequestId: string;
}

const AddSABONumberModal = ({ modalShow, onHide, reimbursementRequestId }: AddSABONumberModalProps) => {
  const toast = useToast();
  const { mutateAsync: setSaboNumber } = useSetSaboNumber(reimbursementRequestId);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset
  } = useForm<{ saboNumber: number }>({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = async (data: { saboNumber: number }) => {
    try {
      await setSaboNumber(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    onHide();
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title="Add SABO Number"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      disabled={!isValid}
      formId="add-sabo-number"
    >
      <FormControl>
        <ReactHookTextField
          control={control}
          name="saboNumber"
          errorMessage={errors.saboNumber}
          placeholder="12345"
          sx={{ width: '280px', height: '60px' }}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default AddSABONumberModal;
