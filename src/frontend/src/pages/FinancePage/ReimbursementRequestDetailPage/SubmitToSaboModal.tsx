import NERModal from '../../../components/NERModal';
import { Box, Grid, Typography, Stack } from '@mui/material';
import { useInputReimbursementRequestInSabo } from '../../../hooks/finance.hooks';
import { OtherProductReason, ReimbursementRequest, WBSElementData, wbsPipe } from 'shared';
import { useCurrentUser, useUserSecureSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { centsToDollar, datePipe } from '../../../utils/pipes';
import DetailDisplay from '../../../components/DetailDisplay';
import { imagePreviewUrl, isReimbursementRequestPendingSaboSubmission } from '../../../utils/reimbursement-request.utils';
import { useToast } from '../../../hooks/toasts.hooks';
import { codeAndRefundSourceName } from '../../../utils/pipes';
import CopyToClipboardButton from '../../../components/CopyToClipboardButton';
import { useCurrentOrganization } from '../../../hooks/organizations.hooks';

interface SubmitToSaboModalProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  reimbursementRequest: ReimbursementRequest;
}

const SubmitToSaboModal = ({ open, setOpen, reimbursementRequest }: SubmitToSaboModalProps) => {
  const user = useCurrentUser();
  const { mutateAsync: inputInSabo } = useInputReimbursementRequestInSabo(reimbursementRequest.reimbursementRequestId);
  const { recipient, dateOfExpense, totalCost, vendor, accountCode, reimbursementProducts, receiptPictures } =
    reimbursementRequest;
  const { data: userInfo, isLoading, isError, error } = useUserSecureSettings(recipient.userId);
  const toast = useToast();
  const isPendingSaboSubmission = isReimbursementRequestPendingSaboSubmission(reimbursementRequest);
  if (!user.isFinance) return <></>;
  if (isLoading || !userInfo) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const filteredProductsNames = reimbursementProducts
    .map((product) =>
      !!(product.reimbursementProductReason as WBSElementData).wbsNum
        ? wbsPipe((product.reimbursementProductReason as WBSElementData).wbsNum) +
          ' - ' +
          (product.reimbursementProductReason as WBSElementData).wbsName
        : (product.reimbursementProductReason as OtherProductReason)
    )
    .filter((product, index, self) => index === self.indexOf(product))
    .join(', ');

  const handleInputInSabo = () => {
    try {
      inputInSabo();
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }

    setOpen(false);
  };

  // TODO: don't hardcode for multitenancy
  const treasurerName = 'Andrew Berkovich';
  const treasurerEmail = 'berkovich.a@northeastern.edu';

  const advisorName = 'Andrew Gouldstone';
  const advisorEmail = 'a.gouldstone@northeastern.edu';

  return (
    <NERModal
      open={open}
      onHide={() => setOpen(false)}
      title="Input these fields into Concur"
      submitText={isPendingSaboSubmission ? undefined : 'Mark as added to Concur'}
      showCloseButton={isPendingSaboSubmission}
      hideFormButtons={isPendingSaboSubmission}
      onSubmit={() => handleInputInSabo()}
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
            content={codeAndRefundSourceName(reimbursementRequest.indexCode)}
            copyButton
          />
        </Grid>
        <Grid item xs={6}>
          <DetailDisplay label={'Account Code'} content={`${accountCode.code} - ${accountCode.name}`} copyButton />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Treasurer:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <Box display="flex" alignItems="center">
              <Typography>{treasurerName}</Typography>
              <CopyToClipboardButton msg={treasurerName} />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>{treasurerEmail}</Typography>
              <CopyToClipboardButton msg={treasurerEmail} />
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
              <Typography style={{ marginRight: '0.5rem' }}>{advisorName}</Typography>
              <CopyToClipboardButton msg={advisorName} />
            </Box>
            <Box display="flex" alignItems="center">
              <Typography>{advisorEmail}</Typography>
              <CopyToClipboardButton msg={advisorEmail} />
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
