import NERModal from '../../../components/NERModal';
import { Box, Grid, Typography, Stack } from '@mui/material';
import { useApproveReimbursementRequest } from '../../../hooks/finance.hooks';
import { OtherProductReason, ReimbursementRequest, WBSElementData, wbsPipe } from 'shared';
import { useCurrentUser, useUserSecureSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { centsToDollar, datePipe } from '../../../utils/pipes';
import DetailDisplay from '../../../components/DetailDisplay';
import { imagePreviewUrl, isReimbursementRequestSaboSubmitted } from '../../../utils/reimbursement-request.utils';
import { useToast } from '../../../hooks/toasts.hooks';
import { codeAndRefundSourceName } from '../../../utils/pipes';
import CopyToClipboardButton from '../../../components/CopyToClipboardButton';

interface SubmitToSaboModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  reimbursementRequest: ReimbursementRequest;
}

const SubmitToSaboModal = ({ open, setOpen, reimbursementRequest }: SubmitToSaboModalProps) => {
  const user = useCurrentUser();
  const { mutateAsync: submitToSabo } = useApproveReimbursementRequest(reimbursementRequest.reimbursementRequestId);
  const { recipient, dateOfExpense, totalCost, vendor, expenseType, reimbursementProducts, receiptPictures } =
    reimbursementRequest;
  const { data: userInfo, isLoading, isError, error } = useUserSecureSettings(recipient.userId);
  const toast = useToast();
  const isSaboSubmitted = isReimbursementRequestSaboSubmitted(reimbursementRequest);
  if (!user.isFinance) return <></>;
  if (isLoading || !userInfo) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const filteredProductsNames = reimbursementProducts
    .filter((product) => !product.dateDeleted)
    .map((product) =>
      !!(product.reimbursementProductReason as WBSElementData).wbsNum
        ? wbsPipe((product.reimbursementProductReason as WBSElementData).wbsNum) +
          ' - ' +
          (product.reimbursementProductReason as WBSElementData).wbsName
        : (product.reimbursementProductReason as OtherProductReason)
    )
    .filter((product, index, self) => index === self.indexOf(product))
    .join(', ');

  const handleSubmitToSabo = () => {
    try {
      submitToSabo();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }

    setOpen(false);
  };

  return (
    <NERModal
      open={open}
      onHide={() => setOpen(false)}
      title="Input these fields into the SABO Form"
      submitText={isSaboSubmitted ? '' : 'Submit to SABO'}
      showCloseButton={isSaboSubmitted}
      hideFormButtons={isSaboSubmitted}
      onSubmit={() => handleSubmitToSabo()}
    >
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <DetailDisplay label={'First Name'} content={recipient.firstName} copyButton />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplay label={'Phone #'} content={userInfo.phoneNumber} copyButton />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplay label={'NUID'} content={userInfo.nuid} copyButton />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplay label={'Last Name'} content={recipient.lastName} copyButton />
        </Grid>
        <Grid item xs={8}>
          <DetailDisplay label={'Email'} content={recipient.email} copyButton />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={5}>
          <DetailDisplay label={'Street Address'} content={userInfo.street} copyButton />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplay label={'City'} content={userInfo.city} copyButton />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplay label={'State'} content={userInfo.state} copyButton />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label={'Zip Code'} content={userInfo.zipcode} copyButton />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={6}>
          <DetailDisplay label={'Date Of Expense'} content={datePipe(dateOfExpense)} copyButton />
        </Grid>
        <Grid item xs={7}>
          <DetailDisplay label={'Total Expense'} content={`$${centsToDollar(totalCost)}`} copyButton />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label={'Expense Decription'} content={`${vendor.name}[${centsToDollar(totalCost)}]`} copyButton />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={12}>
          <DetailDisplay label={'Business Purpose'} content={filteredProductsNames} copyButton />
        </Grid>
        <Grid item xs={7}>
          <DetailDisplay
            label={'SABO Form Index'}
            content={codeAndRefundSourceName(reimbursementRequest.account)}
            copyButton
          />
        </Grid>
        <Grid item xs={6}>
          <DetailDisplay label={'Expense Type'} content={`${expenseType.code} - ${expenseType.name}`} copyButton />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Treasurer:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <Box display="flex" alignItems="center">
              <Typography>Brody Pearlman</Typography>
              <CopyToClipboardButton msg={'Brody Pearlman'} />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>pearlman.br@northeastern.edu</Typography>
              <CopyToClipboardButton msg={'pearlman.br@northeastern.edu'} />
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Club Advisor:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <Box display="flex" alignItems="center">
              <Typography style={{ marginRight: '0.5rem' }}>Andrew Gouldstone</Typography>
              <CopyToClipboardButton msg={'Andrew Gouldstone'} />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>a.gouldstone@northeastern.edu</Typography>
              <CopyToClipboardButton msg={'a.gouldstone@northeastern.edu'} />
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ maxHeight: `250px`, marginTop: 1.5 }}>
        <Typography variant="h5">Receipts</Typography>
        {receiptPictures.map((receipt) => {
          return (
            <iframe
              style={{ height: `200px`, width: '50%' }}
              src={imagePreviewUrl(receipt.googleFileId)}
              title={receipt.name}
            />
          );
        })}
      </Box>
    </NERModal>
  );
};

export default SubmitToSaboModal;
