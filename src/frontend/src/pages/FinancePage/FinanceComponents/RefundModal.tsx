import { yupResolver } from '@hookform/resolvers/yup';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { FormControl, FormLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERFormModal from '../../../components/NERFormModal';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useToast } from '../../../hooks/toasts.hooks';

const schema = yup.object().shape({
  refundAmount: yup
    .number()
    .required('Refund amount is required')
    .positive('Refund amount must be positive')
    .test('two decimals', 'Refund amount must have at most two decimal places', (value) => {
      // technically this allows trailing zeros, but that's fine
      if (!value) return false;

      const strValue = value.toString();
      const parts = strValue.split('.');
      if (parts.length === 1) return true;
      return parts[1].length <= 2;
    })
    .typeError('Refund amount is required'),
  dateReceived: yup.date().required()
});

interface RefundModalProps {
  showModal: boolean;
  handleClose: () => void;
  mutateAsync: (data: any) => void; // if anyone can figure out how to change this without raising type errors, be my guest
  isLoading: boolean;
  defaultValues?: RefundModalInputs;
  title: string;
}

export interface RefundModalInputs {
  refundId?: string;
  refundAmount: string; // this allows us to display default value with 2 decimal places - the type is enforced and casted via the input field and form schema
  dateReceived: Date;
}

const RefundModal: React.FC<RefundModalProps> = ({
  showModal: modalShow,
  handleClose,
  mutateAsync,
  defaultValues,
  isLoading,
  title
}: RefundModalProps) => {
  const toast = useToast();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues ?? {
      refundAmount: '0',
      dateReceived: new Date()
    },
    mode: 'onChange'
  });

  const handleConfirm = async (data: { refundAmount: number; dateReceived: Date }) => {
    handleClose();
    try {
      await mutateAsync({
        refundId: defaultValues?.refundId,
        refundAmount: Math.round(data.refundAmount * 100),
        dateReceived: data.dateReceived.toISOString()
      });
      toast.success(defaultValues ? 'Account credit updated successfully' : 'New account credit reported successfully');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={handleClose}
      title={title}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleConfirm}
      formId="reimbursement-form"
      disabled={!isValid || (defaultValues && defaultValues.refundAmount === watch('refundAmount'))}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <FormControl>
          <FormLabel>Amount</FormLabel>
          <ReactHookTextField
            name="refundAmount"
            type="number"
            control={control}
            sx={{ width: 1 }}
            startAdornment={<AttachMoneyIcon />}
            errorMessage={errors.refundAmount}
          />

          <FormLabel sx={{ paddingTop: 2 }}>Date Received</FormLabel>
          <Controller
            name="dateReceived"
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                format="yyyy-MM-dd"
                onChange={(e) => onChange(e ?? new Date())}
                className={'padding: 10'}
                value={value}
                slotProps={{ textField: { autoComplete: 'off' } }}
              />
            )}
          />
        </FormControl>
      )}
    </NERFormModal>
  );
};

export default RefundModal;
