import { Box, FormControl, InputAdornment } from '@mui/material';
import NERFormModal from '../../components/NERFormModal';
import { useForm } from 'react-hook-form';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';
import { ReportRefundInputs } from './ReportRefund';
import ReactHookTextField from '../../components/ReactHookTextField';

interface ReportRefundViewProps {
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: ReportRefundInputs) => Promise<void>;
}

const ReportRefundView: React.FC<ReportRefundViewProps> = ({ modalShow, onHide, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { isValid },
    reset
  } = useForm({
    mode: 'onChange'
  });

  return (
    <NERFormModal
      open={modalShow}
      onHide={onHide}
      title={'Report New Account Credit'}
      reset={reset}
      handleUseFormSubmit={handleSubmit}
      onFormSubmit={onSubmit}
      formId="reimbursement-form"
      disabled={!isValid}
    >
      <FormControl>
        <ReactHookTextField
          name="newAccountCreditAmount"
          control={control}
          sx={{ width: 1 }}
          type="number"
          startAdornment={<AttachMoneyIcon />}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1, paddingTop: 20 }}>
          <NERSuccessButton sx={{ mx: 1 }} type="submit" form="reimbursement-form" onClick={onSubmit}>
            Submit
          </NERSuccessButton>
          <NERFailButton sx={{ mx: 1 }} form="reimbursement-form" onClick={onHide} disabled={!isValid}>
            Cancel
          </NERFailButton>
        </Box>
      </FormControl>
    </NERFormModal>
  );
};

export default ReportRefundView;
