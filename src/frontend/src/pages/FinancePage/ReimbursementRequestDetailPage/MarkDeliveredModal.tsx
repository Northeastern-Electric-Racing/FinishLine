import { Controller, useForm } from 'react-hook-form';
import NERFormModal from '../../../components/NERFormModal';
import { useMarkReimbursementRequestAsDelivered } from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { ReimbursementRequest } from 'shared';

const schema = yup.object().shape({
  dateDelivered: yup.date().required('Must provide delivery date.'),
  confirmDelivered: yup
    .boolean()
    .required('Please confirm items delivered.')
    .test('is-true', 'Please confirm', (value) => value === true)
});

interface MarkDeliveredModalProps {
  modalShow: boolean;
  onHide: () => void;
  reimbursementRequest: ReimbursementRequest;
}

const MarkDeliveredModal = ({ modalShow, onHide, reimbursementRequest }: MarkDeliveredModalProps) => {
  const toast = useToast();
  const { mutateAsync: markDelivered } = useMarkReimbursementRequestAsDelivered(reimbursementRequest.reimbursementRequestId);

  const dateIsBeforeExpenseCreated = (date: Date): boolean => {
    if (!reimbursementRequest.dateOfExpense) return false;
    else {
      return date < new Date(new Date(reimbursementRequest.dateOfExpense).setHours(0, 0, 0, 0));
    }
  };

  const dateIsInTheFuture = (date: Date) => {
    const now = new Date(new Date().setHours(0, 0, 0, 0));
    return date > now;
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      dateDelivered: new Date(),
      confirmDelivered: false
    },
    mode: 'onChange'
  });

  const handleMarkDelivered = async (data: { dateDelivered: Date; confirmDelivered: boolean }) => {
    if (!data.confirmDelivered) {
      toast.error('Delivery not confirmed!');
    }
    try {
      await markDelivered({ dateDelivered: new Date(data.dateDelivered.setHours(0, 0, 0, 0)) });
      toast.success('Marked as delivered!');
      onHide();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title="Confirm Items Delivered"
      submitText="Submit"
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={handleMarkDelivered}
      formId={'confirm-delivered-form'}
    >
      <FormControl fullWidth>
        <FormLabel>Date Final Item Delivered (MM-DD-YYYY)</FormLabel>
        <Controller
          name="dateDelivered"
          control={control}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              format="MM-dd-yyyy"
              onChange={(date) => onChange(date ?? new Date())}
              className={'padding: 10'}
              value={value}
              shouldDisableDate={(date) => dateIsBeforeExpenseCreated(date) || dateIsInTheFuture(date)}
              slotProps={{ textField: { autoComplete: 'off' } }}
            />
          )}
        />
        <FormLabel>Are you sure the items in this reimbursement request have all been delivered?</FormLabel>
        <Controller
          name="confirmDelivered"
          control={control}
          render={({ field: { onChange, value } }) => (
            <RadioGroup
              value={value}
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
              onChange={onChange}
            >
              <FormControlLabel value={true} control={<Radio />} label="Yes" />
              <FormControlLabel value={false} control={<Radio />} label="No" />
              {errors.confirmDelivered ? (
                <p style={{ color: 'red', fontSize: '12px' }}>Please confirm all items delivered before proceeding.</p>
              ) : null}
            </RadioGroup>
          )}
        />
      </FormControl>
    </NERFormModal>
  );
};

export default MarkDeliveredModal;
