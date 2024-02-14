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
      title="Input these fields into the Sabo Form"
      cancelText={isReimbursementRequestSaboSubmitted(reimbursementRequest) ? '' : 'Cancel'}
      submitText={isReimbursementRequestSaboSubmitted(reimbursementRequest) ? '' : 'Submit to Sabo'}
      onSubmit={() => handleSubmitToSabo()}
    >
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <DetailDisplay label="First Name" content={recipient.firstName}></DetailDisplay>
        </Grid>
        <Grid item xs={4}>
          <DetailDisplay label="Phone #" content={userInfo.phoneNumber} />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplay label="NUID" content={userInfo.nuid} />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplay label="Last Name" content={recipient.lastName} />
        </Grid>
        <Grid item xs={8}>
          <DetailDisplay label="Email" content={recipient.email} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={6}>
          <DetailDisplay label="Street Address" content={userInfo.street} />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplay label="City" content={userInfo.city} />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplay label="State" content={userInfo.state} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Zip Code" content={userInfo.zipcode} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={5}>
          <DetailDisplay label="Date Of Expense" content={datePipe(dateOfExpense)} />
        </Grid>
        <Grid item xs={7}>
          <DetailDisplay label="Total Expense" content={`$${centsToDollar(totalCost)}`} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Expense Description" content={`${vendor.name}[${centsToDollar(totalCost)}]`} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={12}>
          <DetailDisplay label="Business Purpose" content={filteredProductsNames} />
        </Grid>
        <Grid item xs={6}>
          <DetailDisplay label="SABO Form Index" content={codeAndRefundSourceName(reimbursementRequest.account)} />
        </Grid>
        <Grid item xs={6}>
          <DetailDisplay label="Expense Type" content={`${expenseType.code} - ${expenseType.name}`} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Treasurer:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <Typography>Brody Pearlman</Typography>
            <Typography>pearlman.br@northeastern.edu</Typography>
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Club Advisor:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <Typography>Andrew Gouldstone</Typography>
            <Typography>a.gouldstone@northeastern.edu</Typography>
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ maxHeight: `250px`, marginTop: 2 }}>
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
