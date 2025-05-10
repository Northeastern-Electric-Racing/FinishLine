/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Autocomplete,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled,
  Box
} from '@mui/material';
import { OtherProductReason, WbsNumber, validateWBS, wbsPipe, ReimbursementProductFormArgs, IndexCode } from 'shared';
import { RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import { useTheme } from '@mui/system';
import { useEffect, useState, useRef } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useGetAllOtherProductReason } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { formatReasonName } from '../../../utils/reimbursement-request.utils';

interface ReimbursementProductTableProps {
  reimbursementProducts: ReimbursementProductFormArgs[];
  removeProduct: (index: number) => void;
  appendProduct: (args: ReimbursementProductFormArgs) => void;
  wbsElementAutocompleteOptions: {
    label: string;
    id: string;
  }[];
  register: UseFormRegister<ReimbursementRequestFormInput>;
  watch: UseFormRegister<ReimbursementRequestFormInput>;
  errors: FieldErrors<ReimbursementRequestFormInput>;
  setValue: UseFormSetValue<ReimbursementRequestFormInput>;
  control: Control<ReimbursementRequestFormInput>;
  hasMultipleRefundSources?: boolean;
  firstRefundSourceIndexCode?: IndexCode | undefined;
  secondRefundSourceIndexCode?: IndexCode | undefined;
  firstRefundSourceName?: string;
  secondRefundSourceName?: string;
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

const ReimbursementProductTable: React.FC<ReimbursementProductTableProps> = ({
  reimbursementProducts,
  removeProduct,
  appendProduct,
  wbsElementAutocompleteOptions,
  control,
  errors,
  setValue,
  hasMultipleRefundSources = false,
  firstRefundSourceIndexCode,
  secondRefundSourceIndexCode,
  firstRefundSourceName,
  secondRefundSourceName,
  watch
}) => {
  const uniqueWbsElementsWithProducts = new Map<
    string,
    {
      name: string;
      cost: number;
      index: number;
    }[]
  >();

  const onCostBlurHandler = (value: number, index: number) => {
    setValue(`reimbursementProducts.${index}.cost`, parseFloat(value.toFixed(2)));

    if (firstRefundSourceIndexCode) {
      setValue(`reimbursementProducts.${index}.refundSources`, [{ indexCode: firstRefundSourceIndexCode, amount: value }]);
    }
  };

  const userTheme = useTheme();
  const hoverColor = userTheme.palette.action.hover;

  reimbursementProducts.forEach((product, index) => {
    const hasWbsNum = (product.reason as WbsNumber).carNumber !== undefined;
    const productReason = hasWbsNum ? wbsPipe(product.reason as WbsNumber) : (product.reason as OtherProductReason).name;
    if (uniqueWbsElementsWithProducts.has(productReason)) {
      const products = uniqueWbsElementsWithProducts.get(productReason);
      products?.push({ ...product, index });
    } else {
      uniqueWbsElementsWithProducts.set(productReason, [{ ...product, index }]);
    }
  });

  const formatSourceName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  if (typeof firstRefundSourceName === 'string' && firstRefundSourceName !== 'First Source') {
    firstRefundSourceName = formatSourceName(firstRefundSourceName);
  }
  if (typeof secondRefundSourceName === 'string' && secondRefundSourceName !== 'Second Source') {
    secondRefundSourceName = formatSourceName(secondRefundSourceName);
  }
  const onAmountBlurHandler = (
    value: string,
    index: number,
    fieldName: 'cost' | `refundSources.${0}.amount` | `refundSources.${1}.amount`
  ) => {
    const parsedValue = value ? parseFloat(value) : 0;
    setValue(`reimbursementProducts.${index}.${fieldName}`, parsedValue);

    if (hasMultipleRefundSources) {
      const firstSourceAmount = Number(watch(`reimbursementProducts.${index}.refundSources.${0}.amount`)) || 0;
      const secondSourceAmount = Number(watch(`reimbursementProducts.${index}.refundSources.${1}.amount`)) || 0;

      if (firstRefundSourceIndexCode !== undefined) {
        setValue(`reimbursementProducts.${index}.refundSources.${0}.indexCode`, firstRefundSourceIndexCode);
      }

      if (secondRefundSourceIndexCode !== undefined) {
        setValue(`reimbursementProducts.${index}.refundSources.${1}.indexCode`, secondRefundSourceIndexCode);
      }

      setValue(`reimbursementProducts.${index}.cost`, firstSourceAmount + secondSourceAmount);
    }
  };

  const [showFirstSourceFields, setShowFirstSourceFields] = useState(false);
  const [showSecondSourceFields, setShowSecondSourceFields] = useState(false);

  const prevFirstRefundSourceName = useRef(firstRefundSourceName);
  const prevSecondRefundSourceName = useRef(secondRefundSourceName);
  useEffect(() => {
    if (firstRefundSourceName) {
      setShowFirstSourceFields(true);
      if (firstRefundSourceName !== prevFirstRefundSourceName.current) {
        reimbursementProducts.forEach((_, index) => {
          setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
        });
        prevFirstRefundSourceName.current = firstRefundSourceName;
      }
    } else {
      setShowFirstSourceFields(false);
    }
  }, [firstRefundSourceName, setValue, reimbursementProducts]);

  useEffect(() => {
    if (secondRefundSourceName) {
      setShowSecondSourceFields(true);
      if (secondRefundSourceName !== prevSecondRefundSourceName.current) {
        reimbursementProducts.forEach((_, index) => {
          setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
        });
        prevSecondRefundSourceName.current = secondRefundSourceName;
      }
    } else {
      setShowSecondSourceFields(false);
    }
  }, [secondRefundSourceName, setValue, reimbursementProducts]);
  const {
    data: otherReasons,
    isLoading: otherReasonsIsLoading,
    isError: otherReasonIsError,
    error: otherReasonError
  } = useGetAllOtherProductReason();

  if (!otherReasons || otherReasonsIsLoading) {
    return <LoadingIndicator />;
  }
  if (otherReasonIsError) {
    return <ErrorPage message={otherReasonError.message} />;
  }

  return (
    <TableContainer sx={{ borderTop: '1px solid rgb(131, 131, 131)' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              colSpan={2}
              sx={{
                paddingTop: '10px',
                paddingBottom: '10px',
                borderBottom: 0,
                paddingLeft: '0px',
                color: '#dd524c',
                textShadow: '1.5px 0 #dd524c',
                letterSpacing: '0.5px',
                textDecoration: 'underline',
                textUnderlineOffset: '3.5px',
                textDecorationThickness: '0.6px',
                fontSize: 'xx-large',
                fontWeight: 'bold'
              }}
            >
              Items*
            </TableCell>
          </TableRow>
          <TableRow sx={{ width: '100%' }}>
            <TableCell
              colSpan={2}
              sx={{
                borderBottom: 'none',
                padding: '0',
                color: '#dd524c'
              }}
            >
              Add item(s) from a project or from other categories
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            sx={{
              '& .MuiTableCell-root': {
                paddingLeft: '0px',
                paddingRight: '0px'
              }
            }}
          >
            <TableCell
              colSpan={2}
              sx={{
                borderBottom: 0
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'horizontal',
                  gap: '10px'
                }}
              >
                <Autocomplete
                  fullWidth
                  options={wbsElementAutocompleteOptions}
                  onChange={(_e, value) => {
                    if (value) {
                      appendProduct({
                        reason: validateWBS(value.id),
                        name: '',
                        cost: 0,
                        refundSources: []
                      });
                    }
                  }}
                  value={null}
                  blurOnSelect={true}
                  id={'append-product-autocomplete'}
                  size={'small'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
                        background: '#4c4c4c',
                        borderRadius: '20px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px',
                          color: 'white',
                          padding: '13px !important'
                        }
                      }}
                      placeholder="Select Project"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <InputAdornment position="end">
                            <KeyboardArrowDownIcon sx={{ fontSize: 'xxx-large' }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  )}
                />

                <Autocomplete
                  fullWidth
                  options={otherReasons || []}
                  getOptionLabel={(option) => formatReasonName(option.name)}
                  onChange={(_e, value) => {
                    if (value) {
                      appendProduct({
                        reason: value,
                        name: '',
                        cost: 0,
                        refundSources: []
                      });
                    }
                  }}
                  value={null}
                  blurOnSelect={true}
                  id={'append-product-autocomplete'}
                  size={'small'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
                        background: '#4c4c4c',
                        borderRadius: '20px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '20px',
                          color: 'white',
                          padding: '13px !important'
                        }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <InputAdornment position="end">
                            <KeyboardArrowDownIcon sx={{ fontSize: 'xxx-large' }} />
                          </InputAdornment>
                        )
                      }}
                      placeholder="Select Other Category"
                    />
                  )}
                />
              </Box>
            </TableCell>
          </TableRow>
          {Array.from(uniqueWbsElementsWithProducts.keys()).map((key) => {
            return (
              <TableRow
                sx={{
                  '& .MuiTableCell-root': {
                    paddingRight: '0px'
                  }
                }}
                key={key}
              >
                <TableCell>
                  <Typography
                    sx={{
                      color: '#dd524c',
                      textShadow: '0.5px 0 #dd524c',
                      letterSpacing: '0.5px',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3.5px',
                      textDecorationThickness: '0.6x',
                      fontSize: 'medium'
                    }}
                  >
                    {
                      wbsElementAutocompleteOptions
                        .concat(
                          (otherReasons || []).map((reason) => ({
                            id: reason.name,
                            label: formatReasonName(reason.name)
                          }))
                        )
                        .find((value) => value.id === key)?.label
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ flexWrap: 'wrap', listStyle: 'none', p: 0, m: 0 }} component={'ul'}>
                    <Box
                      sx={{
                        color: '#dd524c',
                        textShadow: '0.5px 0 #dd524c',
                        letterSpacing: '0.5px',
                        textUnderlineOffset: '3.5px',
                        textDecorationThickness: '0.6x',
                        fontSize: 'large',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: '3px', sm: '12px' },
                        flexDirection: { xs: 'column', md: 'row' },
                        mb: -1
                      }}
                    >
                      <Box
                        sx={{
                          flex: hasMultipleRefundSources ? { xs: '1', md: '4' } : '7',
                          minWidth: '80px',
                          width: { xs: '100%', md: 'auto' }
                        }}
                      ></Box>
                      {!hasMultipleRefundSources && (
                        <>
                          <Box
                            sx={{ flex: '1.5', width: '100%', textAlign: 'center', display: { xs: 'none', md: 'block' } }}
                          >
                            <label>{firstRefundSourceName}</label>
                          </Box>
                          <Box sx={{ width: '32.5px' }}></Box>
                        </>
                      )}
                      {hasMultipleRefundSources && (
                        <>
                          <Box
                            sx={{ flex: '1.5', width: '100%', textAlign: 'center', display: { xs: 'none', md: 'block' } }}
                          >
                            <label>{firstRefundSourceName}</label>
                          </Box>
                          <Box
                            sx={{ flex: '1.5', width: '100%', textAlign: 'center', display: { xs: 'none', md: 'block' } }}
                          >
                            <label>{secondRefundSourceName}</label>
                          </Box>
                          <Box sx={{ width: '32.5px' }}></Box>
                        </>
                      )}
                    </Box>
                    {uniqueWbsElementsWithProducts.get(key)?.map((product) => (
                      <ListItem key={product.index}>
                        <Box sx={{ display: 'flex' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              width: '100%',
                              alignItems: 'center',
                              gap: { xs: '3px', sm: '12px' },
                              flexDirection: { xs: 'column', md: 'row' }
                            }}
                          >
                            <Box
                              sx={{
                                flex: hasMultipleRefundSources ? { xs: '1', md: '4' } : '7',
                                minWidth: '80px',
                                width: { xs: '100%', md: 'auto' }
                              }}
                            >
                              <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                <Controller
                                  name={`reimbursementProducts.${product.index}.name`}
                                  control={control}
                                  render={({ field }) => (
                                    <TextField
                                      {...field}
                                      sx={{
                                        background: '#4c4c4c',
                                        borderRadius: '20px',
                                        '& .MuiOutlinedInput-root': {
                                          borderRadius: '20px',
                                          color: 'white'
                                        }
                                      }}
                                      placeholder={'Product Name/Description'}
                                      autoComplete="off"
                                      variant={'outlined'}
                                      fullWidth
                                      error={!!errors.reimbursementProducts?.[product.index]?.name}
                                    />
                                  )}
                                />
                                <FormHelperText error>
                                  {errors.reimbursementProducts?.[product.index]?.name?.message}
                                </FormHelperText>
                              </FormControl>
                            </Box>
                            {!hasMultipleRefundSources && (
                              <Box
                                sx={{
                                  flex: '1.5',
                                  width: '100%'
                                }}
                              >
                                <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                  <Controller
                                    name={`reimbursementProducts.${product.index}.cost`}
                                    control={control}
                                    render={({ field }) => (
                                      <TextField
                                        {...field}
                                        sx={{
                                          background: '#4c4c4c',
                                          borderRadius: '20px',
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: '20px',
                                            color: 'white'
                                          },
                                          '& input[type=number]': {
                                            MozAppearance: 'textfield',
                                            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                              WebkitAppearance: 'none',
                                              margin: 0
                                            }
                                          }
                                        }}
                                        value={field.value === 0 ? '' : field.value}
                                        placeholder={'$ Cost'}
                                        variant={'outlined'}
                                        type="number"
                                        fullWidth
                                        onBlur={(e) => onCostBlurHandler(parseFloat(e.target.value), product.index)}
                                        error={!!errors.reimbursementProducts?.[product.index]?.cost}
                                      />
                                    )}
                                  />
                                  <FormHelperText error>
                                    {errors.reimbursementProducts?.[product.index]?.cost?.message}
                                  </FormHelperText>
                                </FormControl>
                              </Box>
                            )}
                            {hasMultipleRefundSources && (
                              <>
                                {showFirstSourceFields && (
                                  <Box
                                    sx={{
                                      flex: '1.5',
                                      width: '100%'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: { xs: 'block', md: 'none' },
                                        textAlign: 'left',
                                        mb: 1,
                                        color: '#dd524c',
                                        textShadow: '0.5px 0 #dd524c',
                                        letterSpacing: '0.5px'
                                      }}
                                    >
                                      <Typography>{firstRefundSourceName}</Typography>
                                    </Box>
                                    <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                      <Controller
                                        name={`reimbursementProducts.${product.index}.refundSources.${0}.amount`}
                                        control={control}
                                        render={({ field }) => (
                                          <TextField
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                              field.onChange(value);
                                            }}
                                            sx={{
                                              background: '#4c4c4c',
                                              borderRadius: '20px',
                                              '& .MuiOutlinedInput-root': {
                                                borderRadius: '20px',
                                                color: 'white'
                                              },
                                              '& input[type=number]': {
                                                MozAppearance: 'textfield',
                                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                  WebkitAppearance: 'none',
                                                  margin: 0
                                                }
                                              }
                                            }}
                                            placeholder={'$ Amt'}
                                            variant={'outlined'}
                                            type="number"
                                            fullWidth
                                            onBlur={(e) =>
                                              onAmountBlurHandler(e.target.value, product.index, `refundSources.${0}.amount`)
                                            }
                                            error={
                                              !!errors.reimbursementProducts?.[product.index]?.refundSources?.[0]?.amount
                                            }
                                          />
                                        )}
                                      />
                                      <FormHelperText error>
                                        {errors.reimbursementProducts?.[product.index]?.refundSources?.[0]?.amount?.message}
                                      </FormHelperText>
                                    </FormControl>
                                  </Box>
                                )}
                                {showSecondSourceFields && (
                                  <Box
                                    sx={{
                                      flex: '1.5',
                                      width: '100%'
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: { xs: 'block', md: 'none' },
                                        textAlign: 'left',
                                        mb: 1,
                                        color: '#dd524c',
                                        textShadow: '0.5px 0 #dd524c',
                                        letterSpacing: '0.5px'
                                      }}
                                    >
                                      <Typography>{secondRefundSourceName}</Typography>
                                    </Box>
                                    <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                      <Controller
                                        name={`reimbursementProducts.${product.index}.refundSources.${1}.amount`}
                                        control={control}
                                        render={({ field }) => (
                                          <TextField
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => {
                                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                              field.onChange(value);
                                            }}
                                            sx={{
                                              background: '#4c4c4c',
                                              borderRadius: '20px',
                                              '& .MuiOutlinedInput-root': {
                                                borderRadius: '20px',
                                                color: 'white'
                                              },
                                              '& input[type=number]': {
                                                MozAppearance: 'textfield',
                                                '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
                                                  WebkitAppearance: 'none',
                                                  margin: 0
                                                }
                                              }
                                            }}
                                            placeholder={'$ Amt'}
                                            variant={'outlined'}
                                            type="number"
                                            fullWidth
                                            onBlur={(e) =>
                                              onAmountBlurHandler(e.target.value, product.index, `refundSources.${1}.amount`)
                                            }
                                            error={
                                              !!errors.reimbursementProducts?.[product.index]?.refundSources?.[1]?.amount
                                            }
                                          />
                                        )}
                                      />
                                      <FormHelperText error>
                                        {errors.reimbursementProducts?.[product.index]?.refundSources?.[1]?.amount?.message}
                                      </FormHelperText>
                                    </FormControl>
                                  </Box>
                                )}
                                <Box
                                  sx={{
                                    display: { xs: 'block', md: 'none' },
                                    width: '100%',
                                    borderBottom: '1px solid rgb(81, 81, 81)',
                                    my: 2
                                  }}
                                />
                              </>
                            )}
                          </Box>
                          <IconButton
                            sx={{
                              alignSelf: { xs: 'flex-start', md: 'center' },
                              marginTop: { xs: '10px', md: '1px' },
                              '&:hover': {
                                backgroundColor: hoverColor
                              }
                            }}
                            onClick={() => removeProduct(product.index)}
                          >
                            <RemoveCircleOutline />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </Box>
                  <Button
                    sx={{
                      marginTop: '-5px'
                    }}
                    startIcon={
                      <AddCircleOutline
                        sx={{
                          '&:focus': {
                            backgroundColor: hoverColor
                          },
                          '&:hover': {
                            backgroundColor: hoverColor
                          },
                          marginRight: '-5px'
                        }}
                      />
                    }
                    onClick={(e) => {
                      appendProduct({
                        reason: key.includes('.') ? validateWBS(key) : ({ name: key } as OtherProductReason),
                        name: '',
                        cost: 0,
                        refundSources: []
                      });
                      e.currentTarget.blur();
                    }}
                  >
                    Add Product
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReimbursementProductTable;
