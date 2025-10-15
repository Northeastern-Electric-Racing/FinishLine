import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HelpIcon from '@mui/icons-material/Help';
import AddIcon from '@mui/icons-material/Add';
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
  Autocomplete,
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
  MAX_FILE_SIZE,
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
import { NERButton } from '../../../components/NERButton';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from '../../../hooks/toasts.hooks';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { wbsNumComparator } from 'shared/src/validate-wbs';
import { codeAndRefundSourceName, accountCodePipe, fullNamePipe } from '../../../utils/pipes';
import { useCreateVendor } from '../../../hooks/finance.hooks';
import { useGetFinanceDelegates } from '../../../hooks/organizations.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

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
  isEditing?: boolean;
  isLeadershipApproved?: boolean;
  onSubmitToFinance?: (data: ReimbursementRequestFormInput) => void;
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
  onSubmitToFinance
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [showAddRefundSourceModal, setShowAddRefundSourceModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState<string>('');
  const [showCreateVendorField, setShowCreateVendorField] = useState<boolean>(false);
  const { mutateAsync: createVendor } = useCreateVendor();

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

      <Box
        sx={{
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          border: '2px solid #d32f2f',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          width: '100%'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}
        >
          <Typography
            sx={{
              color: '#d32f2f',
              fontWeight: 'bold',
              fontSize: '16px',
              textAlign: 'center'
            }}
          >
            To submit Reimbursement Requests you{' '}
            <span style={{ textDecoration: 'underline' }}>
              <strong>must</strong>
            </span>{' '}
            assign the below users as delegates on Concur
          </Typography>
          <Tooltip
            title="In order for the finance team to submit reimbursements on your behalf, you must assign them as delegates in concur. To do this, go to concur (reach out to your head if you do not have concur access), click your profile -> Profile Settings -> Expense Delegates -> add all finance delegates, and ensure they have can prepare permissions."
            placement="right"
          >
            <HelpIcon sx={{ color: '#d32f2f', fontSize: '20px', cursor: 'pointer' }} />
          </Tooltip>
        </Box>
        {financeDelegates.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px' }}>
            {financeDelegates.map((delegate) => (
              <Typography
                key={delegate.userId}
                sx={{
                  color: '#d32f2f',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  backgroundColor: 'rgba(211, 47, 47, 0.2)',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}
              >
                {fullNamePipe(delegate)}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

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

                  const handleCreateVendor = async () => {
                    if (!newVendorName.trim()) {
                      toast.error('Vendor name cannot be empty');
                      return;
                    }

                    try {
                      const newVendor = await createVendor({ name: newVendorName.trim() });
                      toast.success(
                        `Vendor "${newVendorName}" created successfully! You can add logins, discount codes, and notes in the Companies tab.`,
                        5000
                      );
                      onChange(newVendor.vendorId);
                      setNewVendorName('');
                      setShowCreateVendorField(false);
                    } catch (error: any) {
                      toast.error(error?.message || 'Failed to create vendor');
                    }
                  };

                  return (
                    <>
                      {!showCreateVendorField ? (
                        <Autocomplete
                          options={mappedVendors}
                          value={mappedVendors.find((v) => v.id === value) || null}
                          onChange={(_, newValue) => {
                            if (newValue?.id === 'create-new') {
                              setShowCreateVendorField(true);
                            } else if (newValue) {
                              onChange(newValue.id);
                            }
                          }}
                          filterOptions={(options, params) => {
                            const filtered = options.filter((option) =>
                              option.label.toLowerCase().includes(params.inputValue.toLowerCase())
                            );
                            return [...filtered, { id: 'create-new', label: '' }];
                          }}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Vendor"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  background: '#4c4c4c',
                                  borderRadius: '20px',
                                  '& fieldset': {
                                    borderColor: 'transparent'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.23)'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: theme.palette.primary.main
                                  }
                                },
                                '& .MuiInputBase-input': {
                                  color: value ? 'inherit' : 'gray'
                                }
                              }}
                            />
                          )}
                          renderOption={(props, option) => {
                            if (option.id === 'create-new') {
                              return (
                                <Box component="li" {...props} display="flex" alignItems="center">
                                  <AddIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                                  <Typography variant="body2" color="primary">
                                    Create New Vendor
                                  </Typography>
                                </Box>
                              );
                            }
                            return (
                              <Typography component="li" {...props} variant="body2">
                                {option.label}
                              </Typography>
                            );
                          }}
                          sx={{
                            '& .MuiAutocomplete-popupIndicator': {
                              color: 'white'
                            }
                          }}
                        />
                      ) : (
                        <Box display="flex" flexDirection="column" gap={1}>
                          <TextField
                            fullWidth
                            value={newVendorName}
                            onChange={(e) => setNewVendorName(e.target.value)}
                            placeholder="Enter new vendor name"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateVendor();
                              }
                            }}
                            autoFocus
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                background: '#4c4c4c',
                                borderRadius: '20px'
                              }
                            }}
                          />
                          <Box display="flex" gap={1} justifyContent="flex-end">
                            <NERButton
                              variant="outlined"
                              onClick={() => {
                                setShowCreateVendorField(false);
                                setNewVendorName('');
                              }}
                            >
                              Cancel
                            </NERButton>
                            <NERSuccessButton
                              variant="contained"
                              onClick={handleCreateVendor}
                              disabled={!newVendorName.trim()}
                            >
                              Create
                            </NERSuccessButton>
                          </Box>
                        </Box>
                      )}
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
        {isEditing && isLeadershipApproved && (
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
                      onChange={onChange}
                      slotProps={{
                        textField: {
                          error: !!errors.dateOfExpense,
                          helperText: errors.dateOfExpense?.message
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
                  </Button>
                </Box>

                <FormHelperText error>{errors.receiptFiles?.message}</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        )}
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
            disabled={!hasSecureSettingsSet}
            sx={{ background: '#dd524c', color: 'white', borderRadius: '10px' }}
          >
            {submitText}
          </NERSuccessButton>
          {isEditing && isLeadershipApproved && onSubmitToFinance && (
            <NERSuccessButton
              variant="contained"
              onClick={handleSubmit(onSubmitToFinance)}
              disabled={!hasSecureSettingsSet}
              sx={{ background: '#dd524c', color: 'white', borderRadius: '10px' }}
            >
              Save and Submit to Finance
            </NERSuccessButton>
          )}
        </Box>
      </Box>
    </form>
  );
};

export default ReimbursementRequestFormView;
