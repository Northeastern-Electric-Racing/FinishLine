import { Delete } from '@mui/icons-material';
import HelpIcon from '@mui/icons-material/Help';
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Link,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
  Button,
  useTheme
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import { Control, Controller, FieldErrors, UseFormHandleSubmit, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import {
  ClubAccount,
  AccountCode,
  ReimbursementProductFormArgs,
  ReimbursementReceiptCreateArgs,
  ReimbursementReceiptUploadArgs,
  Vendor,
  WbsNumber,
  wbsPipe
} from 'shared';
import { DatePicker } from '@mui/x-date-pickers';
import ReimbursementProductTable from './ReimbursementProductTable';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import { useState } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { wbsNumComparator } from 'shared/src/validate-wbs';
import { codeAndRefundSourceName, accountCodePipe } from '../../../utils/pipes';
import NERAutocomplete from '../../../components/NERAutocomplete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import NERModal from '../../../components/NERModal';
import CheckList from '../../../components/CheckList';

interface ReimbursementRequestFormViewProps {
  allVendors: Vendor[];
  allAccountCodes: AccountCode[];
  receiptFiles: ReimbursementReceiptCreateArgs[];
  allWbsElements: {
    wbsNum: WbsNumber;
    wbsName: string;
  }[];
  control: Control<ReimbursementRequestFormInput, any>;
  reimbursementProducts: ReimbursementProductFormArgs[];
  receiptPrepend: (args: ReimbursementReceiptUploadArgs) => void;
  receiptRemove: (index: number) => void;
  reimbursementProductAppend: (args: ReimbursementProductFormArgs) => void;
  reimbursementProductRemove: (index: number) => void;
  onSubmit: (data: ReimbursementRequestFormInput) => void;
  handleSubmit: UseFormHandleSubmit<ReimbursementRequestFormInput>;
  errors: FieldErrors<ReimbursementRequestFormInput>;
  watch: UseFormWatch<ReimbursementRequestFormInput>;
  submitText: 'Save' | 'Submit';
  previousPage: string;
  setValue: UseFormSetValue<ReimbursementRequestFormInput>;
  hasSecureSettingsSet: boolean;
}

const ReimbursementRequestFormView: React.FC<ReimbursementRequestFormViewProps> = ({
  allVendors,
  allAccountCodes,
  allWbsElements,
  receiptFiles,
  reimbursementProducts,
  control,
  receiptPrepend,
  receiptRemove,
  reimbursementProductAppend,
  reimbursementProductRemove,
  onSubmit,
  handleSubmit,
  errors,
  watch,
  submitText,
  previousPage,
  setValue,
  hasSecureSettingsSet
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const toast = useToast();
  const theme = useTheme();
  const products = watch(`reimbursementProducts`);
  const accountCodeId = watch('accountCodeId');
  const selectedAccountCode = allAccountCodes.find((accountCode) => accountCode.accountCodeId === accountCodeId);
  const refundSources = selectedAccountCode?.allowedRefundSources || [];

  const calculatedTotalCost = products.reduce((acc, product) => acc + Number(product.cost), 0).toFixed(2);
  const [showReimbursementGuidelinesModal, setShowReimbursementGuidelinesModal] = useState(true);

  const wbsElementAutocompleteOptions = allWbsElements.map((wbsElement) => ({
    label: wbsPipe(wbsElement.wbsNum) + ' - ' + wbsElement.wbsName,
    id: wbsPipe(wbsElement.wbsNum)
  }));

  wbsElementAutocompleteOptions.sort((wbsNum1, wbsNum2) => wbsNumComparator(wbsNum1.id, wbsNum2.id));

  const ReceiptFileInput = () => (
    <FormControl>
      <ul>
        {receiptFiles.map((receiptFile, index) => (
          <li key={index}>
            <Stack key={index} direction="row" justifyContent="space-between">
              <Typography>{receiptFile.name}</Typography>
              <IconButton onClick={() => receiptRemove(index)}>
                <Delete />
              </IconButton>
            </Stack>
          </li>
        ))}
      </ul>
    </FormControl>
  );

  const ReimbursementGuidelinesModal = () => (
    <NERModal
      open={showReimbursementGuidelinesModal}
      onHide={() => setShowReimbursementGuidelinesModal(false)}
      title="Finance Checklist"
      cancelText="No"
      submitText="Yes"
      onSubmit={() => setShowReimbursementGuidelinesModal(false)}
    >
      <CheckList
        title="Receipts must have the following: "
        items={[
          {
            resolved: false,
            detail:
              'I certify my receipts with expenses greater than $75 include an itemixed description of goods or service purchased.',
            id: '1'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the vendor's name (for ex. Amazon, stop and shop, Target).`,
            id: '2'
          },
          {
            resolved: false,
            detail: `I certify my receipts includes a Transaction Date for each expense.`,
            id: '3'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the amount paid for each expense.`,
            id: '4'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the form of payment for each expense (Cash, check or last four digits of credit card).`,
            id: '5'
          },
          {
            resolved: false,
            detail: `This reimbursement request is "NOT" for a faculty or full-time staff member.`,
            id: '6'
          },
          {
            resolved: false,
            detail: `The reimbursement does not include sales tax unless it is for a prepared meal or hotel.`,
            id: '7'
          }
        ]}
        isDisabled={false}
        checkDescriptionBullets={false}
      />
    </NERModal>
  );

  const accountCodesToAutocomplete = (accountCode: AccountCode): { label: string; id: string } => {
    return {
      label: accountCodePipe(accountCode),
      id: accountCode.accountCodeId
    };
  };

  const vendorsToAutocomplete = (vendor: Vendor): { label: string; id: string } => {
    return { label: vendor.name, id: vendor.vendorId };
  };

  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        handleSubmit(onSubmit)(e);
      }}
      style={{
        minHeight: 'calc(100vh - 161px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <ReimbursementGuidelinesModal />
      {!hasSecureSettingsSet && (
        <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={true}>
          <Alert variant="filled" severity="warning">
            Your secure settings must be set to create a reimbursement request, you can set them
            <Link style={{ color: 'blue' }} component={RouterLink} to={routes.SETTINGS}>
              {' '}
              here
            </Link>
            .
          </Alert>
        </Snackbar>
      )}
      <Grid container spacing={2}>
        <Grid item container spacing={2} md={6} xs={12} sx={{ '&.MuiGrid-item': { height: 'fit-content' } }}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <FormLabel>Purchased From</FormLabel>
              <Controller
                name="vendorId"
                control={control}
                render={({ field: { onChange, value } }) => {
                  const mappedVendors = allVendors.sort((a, b) => a.name.localeCompare(b.name)).map(vendorsToAutocomplete);
                  const onClear = () => {
                    setValue('vendorId', '');
                    onChange('');
                  };

                  return (
                    <NERAutocomplete
                      id={'vendor'}
                      size="medium"
                      options={mappedVendors}
                      value={mappedVendors.find((vendor) => vendor.id === value) || null}
                      placeholder="Select Vendor"
                      onChange={(_event, newValue) => {
                        newValue ? onChange(newValue.id) : onClear();
                      }}
                    />
                  );
                }}
              />
              <FormHelperText error>{errors.vendorId?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel>Account Code</FormLabel>
              <Controller
                name="accountCodeId"
                control={control}
                render={({ field: { onChange, value } }) => {
                  const mappedAccountCodes = allAccountCodes
                    .filter((accountCode) => accountCode.allowed)
                    .map(accountCodesToAutocomplete);

                  const onClear = () => {
                    setValue('account', undefined);
                    onChange('');
                  };

                  return (
                    <NERAutocomplete
                      id={'accountCode'}
                      size="medium"
                      options={mappedAccountCodes}
                      value={mappedAccountCodes.find((accountCode) => accountCode.id === value) || null}
                      placeholder="Select Account Code"
                      onChange={(_event, newValue) => {
                        newValue ? onChange(newValue.id) : onClear();
                      }}
                    />
                  );
                }}
              />
              <FormHelperText error>{errors.accountCodeId?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
                <FormLabel>Date of Expense</FormLabel>
                <Tooltip
                  title="Reimbursements with Different Purchase Dates Should be on Different Requests. Leave Empty for Not Yet Purchased Items"
                  placement="right"
                >
                  <HelpIcon style={{ fontSize: 'medium', marginLeft: '5px' }} />
                </Tooltip>
              </Box>
              <Controller
                name="dateOfExpense"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    value={value}
                    open={datePickerOpen}
                    onClose={() => setDatePickerOpen(false)}
                    onOpen={() => setDatePickerOpen(true)}
                    onChange={(newValue) => {
                      onChange(newValue ?? new Date());
                    }}
                    slotProps={{
                      textField: {
                        error: !!errors.dateOfExpense,
                        helperText: errors.dateOfExpense?.message,
                        onClick: () => setDatePickerOpen(true),
                        inputProps: { readOnly: true }
                      }
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel>Refund Source</FormLabel>
              <Controller
                name="account"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    onChange={(newValue) => onChange(newValue.target.value as ClubAccount)}
                    value={value}
                    disabled={!selectedAccountCode}
                    error={!!errors.account}
                    displayEmpty
                    renderValue={() => {
                      return value ? (
                        <Typography>{codeAndRefundSourceName(value)} </Typography>
                      ) : (
                        <Typography style={{ color: 'gray' }}>Select Refund Source</Typography>
                      );
                    }}
                  >
                    {refundSources.map((refundSource) => (
                      <MenuItem key={refundSource} value={refundSource}>
                        {codeAndRefundSourceName(refundSource)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText error>{errors.account?.message}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <FormLabel>Receipts</FormLabel>
              <Button
                variant="contained"
                color="success"
                component="label"
                startIcon={<FileUploadIcon />}
                sx={{
                  width: 'fit-content',
                  textTransform: 'none',
                  mt: '9.75px'
                }}
              >
                Upload
                <input
                  onChange={(e) => {
                    if (e.target.files) {
                      [...e.target.files].forEach((file) => {
                        if (file.size < 1000000) {
                          receiptPrepend({
                            file,
                            name: file.name,
                            googleFileId: ''
                          });
                        } else {
                          toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
                          document.getElementById('receipt-image')!.innerHTML = '';
                        }
                      });
                    }
                  }}
                  type="file"
                  id="receipt-image"
                  accept="image/png, image/jpeg, application/pdf"
                  name="receiptFiles"
                  multiple
                  hidden
                />
              </Button>
              <ReceiptFileInput />
              <FormHelperText error>{errors.receiptFiles?.message}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid item md={6} xs={12} sx={{ '&.MuiGrid-item': { paddingTop: '4px' } }}>
          <FormControl fullWidth>
            <ReimbursementProductTable
              errors={errors}
              reimbursementProducts={reimbursementProducts}
              appendProduct={reimbursementProductAppend}
              removeProduct={reimbursementProductRemove}
              wbsElementAutocompleteOptions={wbsElementAutocompleteOptions}
              control={control}
              setValue={setValue}
            />
            <FormHelperText error>{errors.reimbursementProducts?.message}</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          background: theme.palette.background.default,
          p: 1,
          borderTop: `solid 1px ${theme.palette.divider}`,
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <FormLabel>Total Cost</FormLabel>
          <Typography variant="h6">${calculatedTotalCost}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignSelf: 'center' }}>
          <NERFailButton variant="contained" href={previousPage} sx={{ mx: 1 }}>
            Cancel
          </NERFailButton>
          <NERSuccessButton variant="contained" type="submit" disabled={!hasSecureSettingsSet}>
            {submitText}
          </NERSuccessButton>
        </Box>
      </Box>
    </form>
  );
};

export default ReimbursementRequestFormView;
