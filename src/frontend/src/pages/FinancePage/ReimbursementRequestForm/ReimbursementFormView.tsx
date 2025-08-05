import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
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
import {
  Control,
  Controller,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch
} from 'react-hook-form';
import {
  AccountCode,
  CreateRefundSourceArgs,
  IndexCode,
  ReimbursementProductFormArgs,
  ReimbursementReceiptCreateArgs,
  ReimbursementReceiptUploadArgs,
  Vendor,
  WbsNumber,
  wbsPipe
} from 'shared';
import { ClearIcon, DatePicker } from '@mui/x-date-pickers';
import ReimbursementProductTable from './ReimbursementProductTable';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { wbsNumComparator } from 'shared/src/validate-wbs';
import { codeAndRefundSourceName, accountCodePipe } from '../../../utils/pipes';
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
  register: UseFormRegister<ReimbursementRequestFormInput>;
  submitText: 'Save' | 'Submit';
  setValue: UseFormSetValue<ReimbursementRequestFormInput>;
  hasSecureSettingsSet: boolean;
  onFormExit?: () => void;
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
  register,
  submitText,
  setValue,
  hasSecureSettingsSet,
  onFormExit
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showAddRefundSourceModal, setShowAddRefundSourceModal] = useState(false);

  // to grab all the proper refund sources
  const refundSources: CreateRefundSourceArgs[] = Array.from(
    new Set(reimbursementProducts.flatMap((product) => product.refundSources).filter((source) => source.amount > 0))
  );

  const [hasConfirmedFinance, setHasConfirmedFinance] = useState(refundSources.length > 1);
  const toast = useToast();
  const theme = useTheme();
  const products = watch('reimbursementProducts') as ReimbursementProductFormArgs[];
  const accountCodeId = watch('accountCodeId');

  const selectedAccountCode = allAccountCodes.find((accountCode) => accountCode.accountCodeId === accountCodeId);
  const indexCodes: IndexCode[] = useMemo(() => selectedAccountCode?.indexCodes ?? [], [selectedAccountCode?.indexCodes]);

  const firstRefundSourceId = watch('indexCodeId');
  const secondRefundSourceId = watch('secondaryAccount');
  const hasPreFilledData = useRef(true);

  useEffect(() => {
    if (!hasPreFilledData.current) return;

    if (refundSources.length > 1 && refundSources[0].indexCode && refundSources[1].indexCode) {
      setValue('indexCodeId', refundSources[0].indexCode.indexCodeId);
      setValue('secondaryAccount', refundSources[1].indexCode.indexCodeId);
    }

    hasPreFilledData.current = false;
  }, [hasPreFilledData, refundSources, setValue]);

  useEffect(() => {
    if (firstRefundSourceId) {
      if (secondRefundSourceId && firstRefundSourceId === secondRefundSourceId) {
        setValue('secondaryAccount', undefined);

        reimbursementProducts.forEach((_, index) => {
          setValue(`reimbursementProducts.${index}.refundSources.${0}.amount`, 0);
          setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
          setValue(`reimbursementProducts.${index}.cost`, 0);
        });
      }
    }
  }, [firstRefundSourceId, secondRefundSourceId, reimbursementProducts, setValue, watch]);

  // for setting the first refund source in the array
  useEffect(() => {
    if (!firstRefundSourceId || hasConfirmedFinance) return;

    const firstCodeId = indexCodes.find((code) => code.indexCodeId === firstRefundSourceId);
    if (!firstCodeId) return;

    reimbursementProducts.forEach((_, index) => {
      setValue(`reimbursementProducts.${index}.refundSources.${0}`, { indexCode: firstCodeId, amount: 0 });
    });
  }, [firstRefundSourceId, hasConfirmedFinance, indexCodes, reimbursementProducts, setValue, watch]);

  useEffect(() => {
    control._formValues.$hasConfirmedFinance = hasConfirmedFinance;
  }, [hasConfirmedFinance, control]);

  const handleRemoveSecondRefundSource = () => {
    setHasConfirmedFinance(false);
    setValue('secondaryAccount', undefined);

    reimbursementProducts.forEach((_, index) => {
      setValue(`reimbursementProducts.${index}.refundSources.${0}.amount`, 0);
      setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
      setValue(`reimbursementProducts.${index}.cost`, 0);
    });
  };

  useEffect(() => {
    const specificCode = indexCodes.find((code) => code.indexCodeId === secondRefundSourceId);
    if (hasPreFilledData) return;
    if (!specificCode) return;
    reimbursementProducts.forEach((product, index) => {
      setValue(`reimbursementProducts.${index}.refundSources`, [
        product.refundSources[0],
        { indexCode: specificCode, amount: 0 }
      ]);
    });
  }, [hasPreFilledData, indexCodes, reimbursementProducts, secondRefundSourceId, setValue]);

  const handleConfirmAddRefundSource = () => {
    setHasConfirmedFinance(true);
    setShowAddRefundSourceModal(false);
  };

  const firstRefundSource = indexCodes.find((indexCodes) => indexCodes.indexCodeId === firstRefundSourceId) || {
    name: 'First Source',
    code: '',
    indexCodeId: 'placeholder-1'
  };

  const firstRefundSourcePassed = indexCodes.find((code) => code.indexCodeId === firstRefundSourceId) || undefined;

  const secondRefundSource = indexCodes.find((code) => code.indexCodeId === secondRefundSourceId) || {
    name: 'Second Source',
    code: '',
    indexCodeId: 'placeholder-2'
  };

  const secondRefundSourcePassed = indexCodes.find((code) => code.indexCodeId === secondRefundSourceId) || undefined;

  const remainingRefundSources = indexCodes.filter((code) => code.indexCodeId !== firstRefundSourceId);
  const calculatedTotalCost = products
    .reduce((acc: number, product: ReimbursementProductFormArgs) => acc + Number(product.cost), 0)
    .toFixed(2);
  const [showReimbursementGuidelinesModal, setShowReimbursementGuidelinesModal] = useState(true);

  const wbsElementAutocompleteOptions = allWbsElements.map((wbsElement) => ({
    label: wbsPipe(wbsElement.wbsNum) + ' - ' + wbsElement.wbsName,
    id: wbsPipe(wbsElement.wbsNum)
  }));

  wbsElementAutocompleteOptions.sort((wbsNum1, wbsNum2) => wbsNumComparator(wbsNum1.id, wbsNum2.id));

  const ReceiptFileInput = () => (
    <FormControl>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {receiptFiles.map((receiptFile, index) => (
          <li key={index}>
            <Stack
              key={index}
              direction="row"
              justifyContent="space-between"
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#4c4c4c',
                borderRadius: '20px',
                padding: '2px 0px 2px 10px',
                marginBottom: '3px'
              }}
            >
              <Typography
                sx={{
                  marginBottom: '4px',
                  fontSize: 'medium'
                }}
              >
                {receiptFile.name}
              </Typography>
              <IconButton
                onClick={() => receiptRemove(index)}
                sx={{
                  padding: '0px',
                  marginLeft: '2px'
                }}
              >
                <ClearIcon
                  sx={{
                    color: 'grey',
                    transform: 'scale(0.7)'
                  }}
                />
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
              'I certify my receipts with expenses greater than $75 include an itemized description of goods or service purchased.',
            id: '1'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the vendor's name (for ex. Amazon, stop and shop, Target).`,
            id: '2'
          },
          {
            resolved: false,
            detail: `I certify my receipts include a Transaction Date for each expense.`,
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

      <Grid item container spacing={5} md={12} xs={12} sx={{ '&.MuiGrid-item': { height: 'fit-content' } }}>
        <Grid item xs={12} md={6}>
          <Grid item xs={12}>
            <FormControl sx={{ borderRadius: '25px', width: '85%' }}>
              <FormLabel
                sx={{
                  color: '#dd524c',
                  textShadow: '1.5px 0 #dd524c',
                  letterSpacing: '0.5px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3.5px',
                  textDecorationThickness: '0.6px',
                  paddingBottom: '2px',
                  fontSize: 'x-large',
                  fontWeight: 'bold'
                }}
              >
                Purchased From*
              </FormLabel>
              <Controller
                name="vendorId"
                control={control}
                render={({ field: { onChange, value } }) => {
                  const mappedVendors = allVendors.sort((a, b) => a.name.localeCompare(b.name)).map(vendorsToAutocomplete);
                  return (
                    <>
                      <Select
                        displayEmpty
                        value={value}
                        onChange={(e) => {
                          onChange(e.target.value);
                        }}
                        IconComponent={KeyboardArrowDownIcon}
                        sx={{
                          background: '#4c4c4c',
                          borderRadius: '20px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '20px'
                          },
                          '& .MuiSelect-icon': {
                            fontSize: 'xxx-large'
                          }
                        }}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography style={{ color: 'gray' }}>Select Vendor</Typography>;
                          }
                          return mappedVendors.find((vendor) => vendor.id === selected)?.label;
                        }}
                      >
                        {mappedVendors.map((vendor) => (
                          <MenuItem key={vendor.id} value={vendor.id}>
                            {vendor.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error>{errors.vendorId?.message}</FormHelperText>
                    </>
                  );
                }}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ paddingTop: '33px' }}>
            <FormControl sx={{ borderRadius: '25px', width: '85%' }}>
              <FormLabel
                sx={{
                  color: '#dd524c',
                  textShadow: '1.5px 0 #dd524c',
                  letterSpacing: '0.5px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3.5px',
                  textDecorationThickness: '0.6px',
                  paddingBottom: '2px',
                  fontSize: 'x-large',
                  fontWeight: 'bold'
                }}
              >
                Account Code*
              </FormLabel>
              <Controller
                name="accountCodeId"
                control={control}
                render={({ field: { onChange, value } }) => {
                  const mappedAccountCodes = allAccountCodes
                    .filter((accountCode) => accountCode.allowed)
                    .map(accountCodesToAutocomplete);

                  return (
                    <Select
                      value={value}
                      onChange={(e) => {
                        onChange(e.target.value);
                      }}
                      displayEmpty
                      IconComponent={KeyboardArrowDownIcon}
                      sx={{
                        background: '#4c4c4c',
                        borderRadius: '20px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px'
                        },
                        '& .MuiSelect-icon': {
                          fontSize: 'xxx-large'
                        }
                      }}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <Typography style={{ color: 'gray' }}>Select Account Code</Typography>;
                        }
                        return mappedAccountCodes.find((accountCode) => accountCode.id === selected)?.label;
                      }}
                    >
                      {mappedAccountCodes.map((accountCode) => (
                        <MenuItem key={accountCode.id} value={accountCode.id}>
                          {accountCode.label}
                        </MenuItem>
                      ))}
                    </Select>
                  );
                }}
              />
              <FormHelperText error>{errors.accountCodeId?.message}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid item xs={12}>
            <FormControl sx={{ borderRadius: '25px', width: '85%' }}>
              <Box style={{ display: 'flex', verticalAlign: 'middle', alignItems: 'center' }}>
                <FormLabel
                  sx={{
                    color: '#dd524c',
                    textShadow: '1.5px 0 #dd524c',
                    letterSpacing: '0.5px',
                    textDecoration: 'underline',
                    textUnderlineOffset: '3.5px',
                    textDecorationThickness: '0.6px',
                    paddingBottom: '2px',
                    fontSize: 'x-large',
                    fontWeight: 'bold'
                  }}
                >
                  Date of Expense*
                </FormLabel>
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
                    sx={{
                      background: '#4c4c4c',
                      borderRadius: '20px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        color: '#989898'
                      }
                    }}
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
          <Grid item xs={12} sx={{ paddingTop: '38px' }}>
            <FormControl sx={{ display: 'flex', borderRadius: '25px', width: '85%' }}>
              <FormLabel
                sx={{
                  color: '#dd524c',
                  textShadow: '1.5px 0 #dd524c',
                  letterSpacing: '0.5px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3.5px',
                  textDecorationThickness: '0.6px',
                  paddingBottom: '2px',
                  fontSize: 'x-large',
                  fontWeight: 'bold'
                }}
              >
                Receipts
              </FormLabel>

              <Box>
                <ReceiptFileInput />
                <Button
                  variant="contained"
                  color="success"
                  component="label"
                  sx={{
                    width: 'fit-content',
                    textTransform: 'none',
                    color: 'white',
                    marginLeft: '10px'
                  }}
                >
                  Upload
                  <input
                    onChange={(e) => {
                      if (e.target.files) {
                        [...e.target.files].forEach((file) => {
                          /* The regex /^[\w.]+$/ limits the file name to the set of alphanumeric characters (\w) and dots (for file type) */
                          if (file.size >= 1000000) {
                            toast.error(`Error uploading ${file.name}; file must be less than 1 MB`, 5000);
                            document.getElementById('receipt-image')!.innerHTML = '';
                          } else if (file.name.length > 20) {
                            toast.error(`Error uploading ${file.name}; file name must be less than 20 characters`, 5000);
                            document.getElementById('receipt-image')!.innerHTML = '';
                          } else if (!/^[\w.]+$/.test(file.name)) {
                            toast.error(
                              `Error uploading ${file.name}; file name must only contain letter and numbers`,
                              5000
                            );
                            document.getElementById('receipt-image')!.innerHTML = '';
                          } else {
                            receiptPrepend({
                              file,
                              name: file.name,
                              googleFileId: ''
                            });
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
              </Box>

              <FormHelperText error>{errors.receiptFiles?.message}</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid
          item
          xs={12}
          md={12}
          sx={{ display: 'flex', alignItems: { md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 5 }}
        >
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <FormControl sx={{ borderRadius: '25px', width: '85%' }}>
              <FormLabel
                sx={{
                  color: '#dd524c',
                  textShadow: '1.5px 0 #dd524c',
                  letterSpacing: '0.5px',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3.5px',
                  textDecorationThickness: '0.6px',
                  fontSize: 'x-large',
                  fontWeight: 'bold'
                }}
              >
                Refund Source*
              </FormLabel>
              <Controller
                name="indexCodeId"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Select
                    IconComponent={KeyboardArrowDownIcon}
                    onChange={(e) => {
                      onChange(e.target.value);
                    }}
                    value={value}
                    disabled={!selectedAccountCode}
                    error={!!errors.indexCodeId}
                    displayEmpty
                    sx={{
                      background: '#4c4c4c',
                      borderRadius: '20px',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px'
                      },
                      '& .MuiSelect-icon': {
                        fontSize: 'xxx-large'
                      }
                    }}
                    renderValue={(selected) => {
                      if (!selected) {
                        return (
                          <Typography style={{ color: 'gray' }}>
                            {hasConfirmedFinance ? 'Select First Refund Source' : 'Select Refund Source'}
                          </Typography>
                        );
                      }
                      const selectedIndexCode = indexCodes.find((code) => code.indexCodeId === selected);
                      return selectedIndexCode ? (
                        <Typography>{codeAndRefundSourceName(selectedIndexCode)}</Typography>
                      ) : (
                        <Typography style={{ color: 'gray' }}>
                          {hasConfirmedFinance ? 'Select First Refund Source' : 'Select Refund Source'}
                        </Typography>
                      );
                    }}
                  >
                    {indexCodes.map((code) => (
                      <MenuItem key={code.indexCodeId} value={code.indexCodeId}>
                        {codeAndRefundSourceName(code)}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              <FormHelperText error>{errors.indexCodeId?.message}</FormHelperText>
              {!hasConfirmedFinance && (
                <Button
                  sx={{
                    alignSelf: 'flex-start',
                    width: 'auto',
                    marginTop: '5px'
                  }}
                  startIcon={<AddCircleOutline />}
                  onClick={() => setShowAddRefundSourceModal(true)}
                >
                  Add Refund Source
                </Button>
              )}
              {hasConfirmedFinance && (
                <>
                  <Controller
                    name="secondaryAccount"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        IconComponent={KeyboardArrowDownIcon}
                        value={field.value ?? ''}
                        disabled={!selectedAccountCode || !firstRefundSourceId}
                        error={!!errors.secondaryAccount}
                        displayEmpty
                        sx={{
                          background: '#4c4c4c',
                          borderRadius: '20px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '20px'
                          },
                          '& .MuiSelect-icon': {
                            fontSize: 'xxx-large'
                          },
                          marginTop: '10px'
                        }}
                        renderValue={(selected) => {
                          if (!selected) {
                            return <Typography style={{ color: 'gray' }}>Select Second Refund Source</Typography>;
                          }
                          const selectedIndexCode = indexCodes.find((code) => code.indexCodeId === selected);
                          return selectedIndexCode ? (
                            <Typography>{codeAndRefundSourceName(selectedIndexCode)}</Typography>
                          ) : (
                            <Typography style={{ color: 'gray' }}>Select Second Refund Source</Typography>
                          );
                        }}
                      >
                        {remainingRefundSources.map((refundSource) => (
                          <MenuItem key={refundSource.indexCodeId} value={refundSource.indexCodeId}>
                            {codeAndRefundSourceName(refundSource)}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                  <FormHelperText error>{errors.secondaryAccount?.message}</FormHelperText>
                  <Button
                    sx={{
                      alignSelf: 'flex-start',
                      width: 'auto',
                      marginTop: '5px'
                    }}
                    startIcon={<RemoveCircleOutline />}
                    onClick={handleRemoveSecondRefundSource}
                  >
                    Remove Refund Source
                  </Button>
                </>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', width: '85%' }}>
            {showAddRefundSourceModal ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 1 }}>
                <Typography
                  sx={{
                    color: '#dd524c',
                    textShadow: '0.5px 0 #dd524c',
                    letterSpacing: '0.5px',
                    textAlign: 'center'
                  }}
                >
                  Have you confirmed using more than one refund source with Finance?
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#dd524c',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '0px 10px 0px 10px'
                    }}
                    onClick={handleConfirmAddRefundSource}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#dd524c',
                      color: 'white',
                      borderRadius: '10px',
                      padding: '5px 10px 5px 10px'
                    }}
                    onClick={() => setShowAddRefundSourceModal(false)}
                  >
                    No
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography
                sx={{
                  color: '#dd524c',
                  textShadow: '0.5px 0 #dd524c',
                  letterSpacing: '0.5px',
                  textAlign: 'center',
                  paddingBottom: { md: '10px' },
                  width: '100%'
                }}
              >
                {hasConfirmedFinance ? '' : 'Please confirm using multiple refund sources with Finance before submitting!'}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Grid item md={12} xs={12} sx={{ '&.MuiGrid-item': { paddingTop: '80px' } }}>
          <FormControl fullWidth>
            <ReimbursementProductTable
              errors={errors}
              reimbursementProducts={reimbursementProducts}
              appendProduct={reimbursementProductAppend}
              removeProduct={reimbursementProductRemove}
              wbsElementAutocompleteOptions={wbsElementAutocompleteOptions}
              watch={watch}
              register={register}
              setValue={setValue}
              control={control}
              hasMultipleRefundSources={hasConfirmedFinance}
              firstRefundSourceIndexCode={firstRefundSourcePassed}
              secondRefundSourceIndexCode={secondRefundSourcePassed}
              firstRefundSourceName={firstRefundSource.name}
              secondRefundSourceName={secondRefundSource.name}
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
          <NERFailButton
            onClick={() => onFormExit?.()}
            variant="contained"
            sx={{ mx: 1, background: '#dd524c', color: 'white', borderRadius: '10px' }}
          >
            Cancel
          </NERFailButton>
          <NERSuccessButton
            variant="contained"
            type="submit"
            disabled={!hasSecureSettingsSet}
            sx={{ background: '#dd524c', color: 'white', borderRadius: '10px' }}
          >
            {submitText}
          </NERSuccessButton>
        </Box>
      </Box>
    </form>
  );
};

export default ReimbursementRequestFormView;
