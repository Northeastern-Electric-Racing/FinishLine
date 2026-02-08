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
  useTheme,
  TextField
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
  isHead,
  MAX_FILE_SIZE,
  ReimbursementProductFormArgs,
  ReimbursementReceiptUploadArgs,
  Vendor,
  WbsNumber,
  wbsPipe
} from 'shared';
import { ClearIcon, DatePicker } from '@mui/x-date-pickers';
import ReimbursementProductTable from './ReimbursementProductTable';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { NERButton } from '../../../components/NERButton';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { wbsNumComparator } from 'shared';
import { codeAndRefundSourceName, accountCodePipe } from '../../../utils/pipes';
import { imagePreviewUrl } from '../../../utils/reimbursement-request.utils';
import { useCreateVendor } from '../../../hooks/finance.hooks';
import { useGetFinanceDelegates } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useCurrentUser } from '../../../hooks/users.hooks';
import NERAutocomplete from '../../../components/NERAutocomplete';

interface ReimbursementRequestFormViewProps {
  allVendors: Vendor[];
  allAccountCodes: AccountCode[];
  receiptFiles: ReimbursementReceiptUploadArgs[];
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
  isEditing?: boolean;
  isLeadershipApproved?: boolean;
  onSubmitToFinance?: (data: ReimbursementRequestFormInput) => void;
  isSubmitting?: boolean;
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
  onFormExit,
  isEditing = false,
  isLeadershipApproved = false,
  onSubmitToFinance,
  isSubmitting = false
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showAddRefundSourceModal, setShowAddRefundSourceModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState<string>('');
  const [showCreateVendorField, setShowCreateVendorField] = useState<boolean>(false);
  const { mutateAsync: createVendor } = useCreateVendor();
  const user = useCurrentUser();

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
      setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
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

  const wbsElementAutocompleteOptions = allWbsElements.map((wbsElement) => ({
    label: wbsPipe(wbsElement.wbsNum) + ' - ' + wbsElement.wbsName,
    id: wbsPipe(wbsElement.wbsNum)
  }));

  wbsElementAutocompleteOptions.sort((wbsNum1, wbsNum2) => wbsNumComparator(wbsNum1.id, wbsNum2.id));

  const { isLoading, isError, error, data: financeDelegates } = useGetFinanceDelegates();

  if (isLoading || !financeDelegates) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage message={error.message} />;
  }

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
      style={{ width: '100%' }}
    >
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
      <Stack spacing={4} sx={{ mt: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Reimbursement Details
          </Typography>
          <Grid container spacing={3} alignItems="flex-start">
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Vendor */}
                <FormControl sx={{ borderRadius: '25px', width: '100%' }}>
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
                      const mappedVendors = allVendors
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(vendorsToAutocomplete);
                      return (
                        <Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <NERAutocomplete
                                id="vendor-autocomplete"
                                options={mappedVendors}
                                value={mappedVendors.find((v) => v.id === value) || null}
                                onChange={(_, newValue) => {
                                  if (newValue) {
                                    onChange(newValue.id);
                                  }
                                }}
                                size="small"
                                placeholder="Select Existing Vendor"
                                errorMessage={errors.vendorId}
                              />
                            </Box>
                            <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap', lineHeight: 1 }}>
                              OR
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setShowCreateVendorField((prev) => !prev)}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {showCreateVendorField ? 'Cancel' : 'Create Vendor'}
                            </Button>
                          </Box>
                          {showCreateVendorField && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <TextField
                                value={newVendorName}
                                onChange={(e) => setNewVendorName(e.target.value)}
                                placeholder="New Vendor Name"
                                variant="outlined"
                                size="small"
                                fullWidth
                              />
                              <Button
                                variant="contained"
                                size="small"
                                disabled={!newVendorName.trim()}
                                onClick={async () => {
                                  try {
                                    const created = await createVendor({ name: newVendorName.trim() });
                                    setValue('vendorId', created.vendorId);
                                    onChange(created.vendorId);
                                    setNewVendorName('');
                                    setShowCreateVendorField(false);
                                    toast.success(`Vendor '${created.name}' created.`);
                                  } catch (err: any) {
                                    toast.error(err.message || 'Failed to create vendor');
                                  }
                                }}
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                Save
                              </Button>
                            </Box>
                          )}
                        </Box>
                      );
                    }}
                  />
                </FormControl>

                {/* Date of Expense */}
                {(isHead(user.role) || (isEditing && isLeadershipApproved)) && (
                  <FormControl sx={{ borderRadius: '25px', width: '100%' }}>
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
                        Date of Expense{isLeadershipApproved ? '*' : ''}
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
                          onClose={() => setDatePickerOpen(false)}
                          onOpen={() => setDatePickerOpen(true)}
                          onChange={(newValue) => {
                            onChange(newValue ?? new Date());
                          }}
                          slotProps={{
                            textField: {
                              error: !!errors.dateOfExpense,
                              helperText: errors.dateOfExpense?.message,
                              variant: 'outlined',
                              fullWidth: true,
                              size: 'small',
                              InputProps: {
                                onClick: (e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button')) {
                                    setDatePickerOpen(true);
                                  }
                                }
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </FormControl>
                )}

                {/* Refund Sources */}
                <FormControl sx={{ borderRadius: '25px', width: '100%' }}>
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
                    Select Budget/Cash*
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
                        variant="outlined"
                        fullWidth
                        size="small"
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

                  {/* Warning Text / Confirmation Modal Trigger */}
                  {!hasConfirmedFinance && (
                    <Box sx={{ my: 1 }}>
                      {showAddRefundSourceModal ? (
                        <Box
                          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: 1 }}
                        >
                          <Typography
                            sx={{
                              color: '#dd524c',
                              textShadow: '0.5px 0 #dd524c',
                              letterSpacing: '0.5px'
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
                            width: '100%'
                          }}
                        >
                          Please confirm using multiple refund sources with Finance before submitting!
                        </Typography>
                      )}
                    </Box>
                  )}

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
                            variant="outlined"
                            fullWidth
                            size="small"
                            sx={{ marginTop: '10px' }}
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
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {/* Description */}
                <FormControl sx={{ borderRadius: '25px', width: '100%' }}>
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
                    Input Description
                  </FormLabel>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <TextField
                        value={value || ''}
                        onChange={onChange}
                        placeholder="Enter Description"
                        multiline
                        rows={3}
                      />
                    )}
                  />
                </FormControl>

                {/* Account Code */}
                <FormControl sx={{ borderRadius: '25px', width: '100%' }}>
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
                          variant="outlined"
                          fullWidth
                          size="small"
                          IconComponent={KeyboardArrowDownIcon}
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

                {/* Upload Receipts */}
                <FormControl sx={{ display: 'flex', borderRadius: '25px', width: '100%' }}>
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
                    Upload Receipts{isLeadershipApproved ? '*' : ''}
                  </FormLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <NERButton
                      variant="contained"
                      color="success"
                      component="label"
                      sx={{
                        width: 'fit-content',
                        textTransform: 'none',
                        color: 'white'
                      }}
                    >
                      Upload
                      <input
                        onChange={(e) => {
                          if (e.target.files) {
                            [...e.target.files].forEach((file) => {
                              if (file.size >= MAX_FILE_SIZE) {
                                toast.error(
                                  `Error uploading ${file.name}; file must be less than ${MAX_FILE_SIZE / 1024 / 1024} MB`,
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
                    </NERButton>
                  </Box>
                  <FormHelperText error>{errors.receiptFiles?.message}</FormHelperText>

                  {/* Receipt Previews */}
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      {receiptFiles.map((receiptFile, index) => {
                        let previewUrl = '';
                        // if file is newly uploaded, show local preview, else show google drive preview
                        if (receiptFile.file) {
                          previewUrl = URL.createObjectURL(receiptFile.file);
                        } else if (receiptFile.googleFileId) {
                          previewUrl = imagePreviewUrl(receiptFile.googleFileId);
                        }

                        return (
                          <Grid item xs={6} key={index}>
                            <Stack
                              direction="column"
                              spacing={1}
                              sx={{
                                background: '#4c4c4c',
                                borderRadius: '10px',
                                padding: '10px',
                                height: '100%'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                  sx={{
                                    fontSize: 'small',
                                    wordBreak: 'break-all',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {receiptFile.name}
                                </Typography>
                                <IconButton
                                  onClick={() => receiptRemove(index)}
                                  size="small"
                                  sx={{
                                    padding: '2px'
                                  }}
                                >
                                  <ClearIcon
                                    sx={{
                                      color: 'grey',
                                      fontSize: 'small'
                                    }}
                                  />
                                </IconButton>
                              </Box>
                              {previewUrl &&
                                receiptFile.file &&
                                (receiptFile.name.toLowerCase().endsWith('.png') ||
                                  receiptFile.name.toLowerCase().endsWith('.jpg') ||
                                  receiptFile.name.toLowerCase().endsWith('.jpeg')) && (
                                  <Box
                                    component="img"
                                    src={previewUrl}
                                    alt={receiptFile.name}
                                    sx={{
                                      maxWidth: '100%',
                                      maxHeight: '150px',
                                      width: 'auto',
                                      height: 'auto',
                                      objectFit: 'contain',
                                      borderRadius: '4px',
                                      alignSelf: 'center',
                                      bgcolor: 'rgba(0,0,0,0.2)'
                                    }}
                                  />
                                )}
                              {previewUrl && receiptFile.googleFileId && (
                                <Box
                                  component="iframe"
                                  src={previewUrl}
                                  title={receiptFile.name}
                                  sx={{
                                    width: '100%',
                                    height: '150px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    bgcolor: 'rgba(0,0,0,0.2)'
                                  }}
                                />
                              )}
                              {!previewUrl && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  Preview not available
                                </Typography>
                              )}
                            </Stack>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Purchased Products
          </Typography>
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
        </Box>
      </Stack>
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
        <Box sx={{ display: 'flex', alignSelf: 'center', gap: 1 }}>
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
            disabled={!hasSecureSettingsSet || isSubmitting}
            sx={{ background: '#dd524c', color: 'white', borderRadius: '10px' }}
          >
            {isSubmitting ? 'Submitting...' : submitText}
          </NERSuccessButton>
          {(isHead(user.role) || (isEditing && isLeadershipApproved)) && onSubmitToFinance && (
            <NERSuccessButton
              variant="contained"
              onClick={handleSubmit(onSubmitToFinance)}
              disabled={!hasSecureSettingsSet || isSubmitting}
              sx={{ background: '#dd524c', color: 'white', borderRadius: '10px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Save and Submit to Finance'}
            </NERSuccessButton>
          )}
        </Box>
      </Box>
    </form>
  );
};

export default ReimbursementRequestFormView;
