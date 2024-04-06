import NERModal from '../../../components/NERModal';
import { Box, Grid, Typography, Stack, Button } from '@mui/material';
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';

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

  const CopyToClipboardButton = ({ msg }: { msg: string }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
      navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); //to only show "Copied!" for 2 secs
    };

    return (
      <>
        {copied ? (
          <span style={{ marginLeft: '0.7rem', color: 'green', fontSize: '12px' }}>Copied!</span>
        ) : (
          <Button onClick={copyToClipboard}>
            <ContentCopyIcon style={{ fontSize: '13px' }} />
          </Button>
        )}
      </>
    );
  };

  const DetailDisplayWithCopyToClipboard = ({ label, content }: { label: string; content: string }) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <DetailDisplay label={label} content={content}></DetailDisplay>
        <CopyToClipboardButton msg={content} />
      </div>
    );
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
          <DetailDisplayWithCopyToClipboard label={'First Name'} content={recipient.firstName} />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplayWithCopyToClipboard label={'Phone #'} content={userInfo.phoneNumber} />
        </Grid>
        <Grid item xs={4}>
          <DetailDisplayWithCopyToClipboard label={'NUID'} content={userInfo.nuid} />
        </Grid>
      </Grid>
      <Grid container spacing={1}>
        <Grid item xs={4}>
          <DetailDisplayWithCopyToClipboard label={'Last Name'} content={recipient.lastName} />
        </Grid>
        <Grid item xs={8}>
          <DetailDisplayWithCopyToClipboard label={'Email'} content={recipient.email} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={5}>
          <DetailDisplayWithCopyToClipboard label={'Street Address'} content={userInfo.street} />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplayWithCopyToClipboard label={'City'} content={userInfo.city} />
        </Grid>
        <Grid item xs={3}>
          <DetailDisplayWithCopyToClipboard label={'State'} content={userInfo.state} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplayWithCopyToClipboard label={'Zip Code'} content={userInfo.zipcode} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={6}>
          <DetailDisplayWithCopyToClipboard label={'Date Of Expense'} content={datePipe(dateOfExpense)} />
        </Grid>
        <Grid item xs={7}>
          <DetailDisplayWithCopyToClipboard label={'Total Expense'} content={`$${centsToDollar(totalCost)}`} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplayWithCopyToClipboard
            label={'Expense Decription'}
            content={`${vendor.name}[${centsToDollar(totalCost)}]`}
          />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={12}>
          <DetailDisplayWithCopyToClipboard label={'Business Purpose'} content={filteredProductsNames} />
        </Grid>
        <Grid item xs={7}>
          <DetailDisplayWithCopyToClipboard
            label={'SABO Form Index'}
            content={codeAndRefundSourceName(reimbursementRequest.account)}
          />
        </Grid>
        <Grid item xs={6}>
          <DetailDisplayWithCopyToClipboard label={'Expense Type'} content={`${expenseType.code} - ${expenseType.name}`} />
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Treasurer:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography>Brody Pearlman</Typography>
              <CopyToClipboardButton msg={'Brody Pearlman'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography>pearlman.br@northeastern.edu</Typography>
              <CopyToClipboardButton msg={'pearlman.br@northeastern.edu'} />
            </div>
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={1} sx={{ marginTop: 2 }}>
        <Grid item xs={4}>
          <Typography sx={{ fontWeight: 'bold' }}>Club Advisor:</Typography>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography style={{ marginRight: '0.5rem' }}>Andrew Gouldstone</Typography>
              <CopyToClipboardButton msg={'Andrew Gouldstone'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography>a.gouldstone@northeastern.edu</Typography>
              <CopyToClipboardButton msg={'a.gouldstone@northeastern.edu'} />
            </div>
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
