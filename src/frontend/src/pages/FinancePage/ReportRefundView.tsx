import { Box, FormControl, InputAdornment } from '@mui/material';
import NERFormModal from '../../components/NERFormModal';
import ReactHookTextField from '../../components/ReactHookTextField';
import { useForm } from 'react-hook-form';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NERFailButton from '../../components/NERFailButton';
import NERSuccessButton from '../../components/NERSuccessButton';

interface ReportRefundViewProps {
  modalShow: boolean;
  onHide: () => void;
  onSubmit: (data: number) => Promise<void>;
}

const ReportRefundView: React.FC<ReportRefundViewProps> = ({ modalShow, onHide, onSubmit }) => {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
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
          control={control}
          errorMessage={errors}
          sx={{ width: 1 }}
          type="number"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon />
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
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
