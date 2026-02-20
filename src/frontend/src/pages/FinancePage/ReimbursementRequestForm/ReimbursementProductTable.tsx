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
import {
  OtherProductReason,
  WbsNumber,
  validateWBS,
  wbsPipe,
  ReimbursementProductFormArgs,
  IndexCode,
  CreateRefundSourceArgs
} from 'shared';
import { RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import { useTheme } from '@mui/system';
import { useEffect, useState, useRef } from 'react';
import { useGetAllOtherProductReason } from '../../../hooks/finance.hooks';
import { useGetMaterialsForWbsElement } from '../../../hooks/bom.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { formatReasonName } from '../../../utils/reimbursement-request.utils';
import { Material } from 'shared';
import { set } from 'date-fns';

interface ReimbursementProductTableProps {
  reimbursementProducts: ReimbursementProductFormArgs[];
  removeProduct: (index: number) => void;
  appendProduct: (args: ReimbursementProductFormArgs) => void;
  wbsElementAutocompleteOptions: {
    label: string;
    id: string;
  }[];
  register: UseFormRegister<ReimbursementRequestFormInput>;
  watch: UseFormWatch<ReimbursementRequestFormInput>;
  errors: FieldErrors<ReimbursementRequestFormInput>;
  setValue: UseFormSetValue<ReimbursementRequestFormInput>;
  control: Control<ReimbursementRequestFormInput>;
  hasMultipleRefundSources?: boolean;
  firstRefundSourceIndexCode?: IndexCode;
  secondRefundSourceIndexCode?: IndexCode;
  firstRefundSourceName?: string;
  secondRefundSourceName?: string;
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

const MaterialAutocomplete: React.FC<{
  wbsNum: WbsNumber;
  onSelect: (material: Material) => void;
  initialValue?: string;
}> = ({ wbsNum, onSelect, initialValue }) => {
  const { data: materials, isLoading, isError, error } = useGetMaterialsForWbsElement(wbsNum);
  const [userSelected, setUserSelected] = useState<{ id: string; label: string } | null>(null);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage message={error?.message || 'Failed to load materials'} />;
  }

  const materialOptions = (materials || []).map((material) => ({
    id: material.materialId,
    label: `${material.name}: ${material.manufacturerName}, ${material.manufacturerPartNumber}`
  }));

  const selectedOption = userSelected ?? materialOptions.find((o) => o.label === initialValue) ?? null;

  return (
    <Autocomplete
      sx={{ flex: 1 }}
      options={materialOptions}
      getOptionLabel={(option) => option.label}
      onChange={(_, value) => {
        setUserSelected(value);
        if (value) {
          const selectedMaterial = materials?.find((m) => m.materialId === value.id);
          if (selectedMaterial) {
            onSelect(selectedMaterial);
          }
        }
      }}
      value={selectedOption}
      blurOnSelect={true}
      size={'small'}
      renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select Material" fullWidth />}
    />
  );
};

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
      id?: string;
      reason: WbsNumber | OtherProductReason;
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
      products?.push({ ...product, index, id: product.id, reason: product.reason });
    } else {
      uniqueWbsElementsWithProducts.set(productReason, [{ ...product, index, id: product.id, reason: product.reason }]);
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
  const prevHasMultipleRefundSources = useRef(hasMultipleRefundSources);

  const refundSources: CreateRefundSourceArgs[] = Array.from(
    new Set(reimbursementProducts.flatMap((product) => product.refundSources).filter((source) => source.amount > 0))
  );

  // in the event the data was from a prior refund request
  const hasPreFilledData = useRef(false);
  const hasInitializedRefundSources = useRef(false);

  useEffect(() => {
    if (hasInitializedRefundSources.current) return;

    if (refundSources.length > 1) {
      reimbursementProducts.forEach((product, index) => {
        setValue(`reimbursementProducts.${index}.refundSources.${0}.amount`, (product.refundSources[0]?.amount ?? 0) / 100);
        setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, (product.refundSources[1]?.amount ?? 0) / 100);
      });
      hasPreFilledData.current = true;
    }

    hasInitializedRefundSources.current = true;
  }, [refundSources, setValue, reimbursementProducts]);

  // Handle transition from single to multiple refund sources
  useEffect(() => {
    if (hasMultipleRefundSources && !prevHasMultipleRefundSources.current) {
      setTimeout(() => {
        const products = watch('reimbursementProducts') || [];
        products.forEach((product: ReimbursementProductFormArgs, index: number) => {
          const currentCost = product.cost ?? 0;
          setValue(`reimbursementProducts.${index}.refundSources.${0}.amount`, currentCost);
          setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
        });
      }, 0);
    }
    prevHasMultipleRefundSources.current = hasMultipleRefundSources;
  }, [hasMultipleRefundSources, setValue, watch]);

  useEffect(() => {
    if (firstRefundSourceName) {
      setShowFirstSourceFields(true);
      prevFirstRefundSourceName.current = firstRefundSourceName;
    } else {
      setShowFirstSourceFields(false);
    }
  }, [firstRefundSourceName]);

  useEffect(() => {
    if (secondRefundSourceName) {
      setShowSecondSourceFields(true);
      prevSecondRefundSourceName.current = secondRefundSourceName;
    } else {
      setShowSecondSourceFields(false);
    }
  }, [secondRefundSourceName]);
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
              Purchased Items*
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
              Associate each item with a project, or select a category from "Other Categories" if the item is not linked to a
              project.
              <br />
              Multiple items can be added under the same project or category.
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
                  flexDirection: 'row',
                  flexWrap: 'nowrap',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%'
                }}
              >
                <Autocomplete
                  sx={{ flex: 1 }}
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
                    <TextField {...params} variant="outlined" placeholder="Select Project" fullWidth />
                  )}
                />
                <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                  OR
                </Typography>
                <Autocomplete
                  sx={{ flex: 1 }}
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
                  id={'append-other-category-autocomplete'}
                  size={'small'}
                  renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Select Other Category" fullWidth />
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
                    {uniqueWbsElementsWithProducts.get(key)?.map((product) => {
                      const currentName = watch(`reimbursementProducts.${product.index}.name`);
                      return (
                        <ListItem key={product.id}>
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
                                {'carNumber' in product.reason ? ( // if selected is a project
                                  <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                    <MaterialAutocomplete
                                      wbsNum={product.reason as WbsNumber}
                                      initialValue={currentName}
                                      onSelect={(material) => {
                                        const label = `${material.name}: ${material.manufacturerName}, ${material.manufacturerPartNumber}`;
                                        setValue(`reimbursementProducts.${product.index}.name`, label);
                                      }}
                                    />
                                    <FormHelperText error>
                                      {errors.reimbursementProducts?.[product.index]?.name?.message}
                                    </FormHelperText>
                                  </FormControl>
                                ) : (
                                  <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                    <Controller
                                      name={`reimbursementProducts.${product.index}.name`}
                                      control={control}
                                      render={({ field }) => (
                                        <TextField
                                          {...field}
                                          variant="outlined"
                                          placeholder={'Product Name/Description'}
                                          autoComplete="off"
                                          fullWidth
                                          error={!!errors.reimbursementProducts?.[product.index]?.name}
                                        />
                                      )}
                                    />
                                    <FormHelperText error>
                                      {errors.reimbursementProducts?.[product.index]?.name?.message}
                                    </FormHelperText>
                                  </FormControl>
                                )}
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
                                          variant="outlined"
                                          value={field.value === 0 ? '' : field.value}
                                          placeholder={'$ Cost'}
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
                                              value={field.value === 0 ? '' : field.value}
                                              disabled={firstRefundSourceIndexCode === undefined}
                                              variant="outlined"
                                              placeholder={'$ Amt'}
                                              type="number"
                                              fullWidth
                                              onBlur={(e) =>
                                                onAmountBlurHandler(
                                                  e.target.value,
                                                  product.index,
                                                  `refundSources.${0}.amount`
                                                )
                                              }
                                              error={
                                                !!errors.reimbursementProducts?.[product.index]?.refundSources?.[0]?.amount
                                              }
                                            />
                                          )}
                                        />
                                        <FormHelperText error>
                                          {
                                            errors.reimbursementProducts?.[product.index]?.refundSources?.[0]?.amount
                                              ?.message
                                          }
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
                                              value={field.value === 0 ? '' : field.value}
                                              disabled={secondRefundSourceIndexCode === undefined}
                                              variant="outlined"
                                              placeholder={'$ Amt'}
                                              type="number"
                                              fullWidth
                                              onBlur={(e) =>
                                                onAmountBlurHandler(
                                                  e.target.value,
                                                  product.index,
                                                  `refundSources.${1}.amount`
                                                )
                                              }
                                              error={
                                                !!errors.reimbursementProducts?.[product.index]?.refundSources?.[1]?.amount
                                              }
                                            />
                                          )}
                                        />
                                        <FormHelperText error>
                                          {
                                            errors.reimbursementProducts?.[product.index]?.refundSources?.[1]?.amount
                                              ?.message
                                          }
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
                      );
                    })}
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
                      const existingProducts = uniqueWbsElementsWithProducts.get(key);
                      if (existingProducts && existingProducts.length > 0) {
                        appendProduct({
                          reason: existingProducts[0].reason,
                          name: '',
                          cost: 0,
                          refundSources: []
                        });
                      }
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
