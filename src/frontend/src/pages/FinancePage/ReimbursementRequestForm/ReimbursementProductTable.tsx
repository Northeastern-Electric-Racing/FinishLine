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
  IndexCode,
  CreateRefundSourceArgs,
  Material,
  ProjectPreview
} from 'shared';
import { RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
import { Control, Controller, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { ReimbursementRequestFormInput, ProductWithLocalFields } from './ReimbursementRequestForm';
import { useTheme } from '@mui/system';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useGetAllOtherProductReason } from '../../../hooks/finance.hooks';
import { useGetMaterialsForWbsElement } from '../../../hooks/bom.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { formatReasonName } from '../../../utils/reimbursement-request.utils';
import CreateMaterialModal from '../../ProjectDetailPage/ProjectViewContainer/BOM/MaterialForm/CreateMaterialModal';

interface ReimbursementProductTableProps {
  reimbursementProducts: ProductWithLocalFields[];
  prependProduct: (args: ProductWithLocalFields) => void;
  removeProduct: (index: number) => void;
  projectAutocompleteOptions: {
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
  allProjects: ProjectPreview[];
  applySplitShippingToProducts: (totalShipping?: number) => void;
  isEditing?: boolean;
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

const MaterialAutocomplete: React.FC<{
  wbsNum: WbsNumber;
  onSelect: (material: Material | null) => void;
  initialValue?: string;
}> = ({ wbsNum, onSelect, initialValue }) => {
  const { data: materials, isLoading, isError, error } = useGetMaterialsForWbsElement(wbsNum);
  const [materialSelected, setMaterialSelected] = useState<{ id: string; label: string } | null>(null);

  const materialOptions = useMemo(
    () =>
      (materials ?? []).map((material) => ({
        id: material.materialId,
        label: `${material.name} (${material.materialTypeName}): ${material.manufacturerName ?? 'N/A'}, ${material.manufacturerPartNumber ?? 'N/A'}`
      })),
    [materials]
  );

  useEffect(() => {
    if (!materials || !initialValue) return;

    // Fetch pre-existing label
    let match = materialOptions.find((o) => o.label === initialValue) ?? null;

    // Otherwise fetch new material by name
    if (!match) {
      const materialByName = materials.find((m) => m.name === initialValue);
      if (materialByName) match = materialOptions.find((o) => o.id === materialByName.materialId) ?? null;
    }

    if (match && match.id !== materialSelected?.id) {
      setMaterialSelected(match);
      // Update the form value to the formatted label
      const fullMaterial = materials.find((m) => m.materialId === match!.id) ?? null;
      onSelect(fullMaterial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials, initialValue]);

  if (isLoading || !materials) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return (
      <TextField
        variant="outlined"
        placeholder="Select Material"
        fullWidth
        size="small"
        error
        disabled
        helperText={error?.message || 'Failed to load materials'}
      />
    );
  }

  return (
    <Autocomplete
      sx={{ flex: 1 }}
      options={materialOptions}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onChange={(_, value) => {
        setMaterialSelected(value);
        const selectedMaterial = value ? (materials.find((m) => m.materialId === value.id) ?? null) : null;
        onSelect(selectedMaterial);
      }}
      value={materialSelected}
      blurOnSelect={true}
      size={'small'}
      renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select Material" fullWidth />}
    />
  );
};

const ReimbursementProductTable: React.FC<ReimbursementProductTableProps> = ({
  reimbursementProducts,
  removeProduct,
  prependProduct,
  projectAutocompleteOptions,
  control,
  errors,
  setValue,
  hasMultipleRefundSources = false,
  firstRefundSourceIndexCode,
  firstRefundSourceName,
  secondRefundSourceName,
  watch,
  allProjects,
  applySplitShippingToProducts,
  isEditing = false
}) => {
  const uniqueWbsElementsWithProducts = new Map<
    string,
    {
      name?: string;
      cost: number;
      index: number;
      id?: string;
      reason: WbsNumber | OtherProductReason;
    }[]
  >();

  const [showCreateMaterialModal, setShowCreateMaterialModal] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState<number | null>(null);
  const [currentProject, setCurrentProject] = useState<ProjectPreview | null>(null);
  const [pendingMaterialIndices, setPendingMaterialIndices] = useState<Set<number>>(new Set());

  const onCostBlurHandler = (value: number, index: number) => {
    const roundedBaseCost = Number((value || 0).toFixed(2));
    const product = (watch(`reimbursementProducts.${index}` as const) as ProductWithLocalFields) ?? {};

    const updatedProduct: ProductWithLocalFields = {
      ...product,
      __baseCost: roundedBaseCost
    };

    setValue(`reimbursementProducts.${index}`, updatedProduct, {
      shouldDirty: true,
      shouldValidate: true
    });

    recalculateRowTotal(index);
  };

  const onShippingBlurHandler = (value: number, index: number) => {
    const roundedShippingCost = Number((value || 0).toFixed(2));
    const product = (watch(`reimbursementProducts.${index}` as const) as ProductWithLocalFields) ?? {};

    const updatedProduct: ProductWithLocalFields = {
      ...product,
      __shippingCost: roundedShippingCost
    };

    setValue(`reimbursementProducts.${index}`, updatedProduct, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (hasMultipleRefundSources) {
      const firstSourceAmount = Number(product?.refundSources?.[0]?.amount ?? 0);
      const secondSourceAmount = Number(product?.refundSources?.[1]?.amount ?? 0);

      setValue(`reimbursementProducts.${index}.cost`, Number((firstSourceAmount + secondSourceAmount).toFixed(2)), {
        shouldDirty: true,
        shouldValidate: true
      });
    } else {
      recalculateRowTotal(index);
    }
  };

  const updateSingleSourceRefund = (index: number, totalRowCost: number) => {
    if (firstRefundSourceIndexCode && !hasMultipleRefundSources) {
      setValue(`reimbursementProducts.${index}.refundSources`, [
        { indexCode: firstRefundSourceIndexCode, amount: totalRowCost }
      ]);
    }
  };

  const recalculateRowTotal = (index: number) => {
    const product = watch(`reimbursementProducts.${index}` as const) as ProductWithLocalFields;
    const baseCost = Number(product?.__baseCost ?? 0);
    const shippingCost = Number(product?.__shippingCost ?? 0);
    const totalRowCost = Number((baseCost + shippingCost).toFixed(2));

    setValue(`reimbursementProducts.${index}.cost`, totalRowCost, {
      shouldDirty: true,
      shouldValidate: true
    });

    updateSingleSourceRefund(index, totalRowCost);
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
    fieldName: 'refundSources.0.amount' | 'refundSources.1.amount'
  ) => {
    const parsedValue = value ? parseFloat(value) : 0;
    const product = (watch(`reimbursementProducts.${index}` as const) as ProductWithLocalFields) ?? {};

    const firstSourceAmount =
      fieldName === 'refundSources.0.amount' ? parsedValue : Number(product?.refundSources?.[0]?.amount ?? 0);

    const secondSourceAmount =
      fieldName === 'refundSources.1.amount' ? parsedValue : Number(product?.refundSources?.[1]?.amount ?? 0);

    setValue(`reimbursementProducts.${index}.${fieldName}`, parsedValue, {
      shouldDirty: true,
      shouldValidate: true
    });

    if (hasMultipleRefundSources) {
      const shippingCost = Number(product.__shippingCost ?? 0);
      const baseCost = Number((firstSourceAmount + secondSourceAmount).toFixed(2));
      const productTotal = Number((baseCost + shippingCost).toFixed(2));

      setValue(`reimbursementProducts.${index}.__baseCost`, baseCost, {
        shouldDirty: true,
        shouldValidate: true
      });

      setValue(`reimbursementProducts.${index}.cost`, productTotal, {
        shouldDirty: true,
        shouldValidate: true
      });
    }
  };

  const handleOpenCreateMaterial = (productIndex: number, projectWbsNum: WbsNumber) => {
    const project = allProjects.find(
      (proj) =>
        proj.wbsNum.carNumber === projectWbsNum.carNumber && proj.wbsNum.projectNumber === projectWbsNum.projectNumber
    );

    if (project) {
      setCurrentProductIndex(productIndex);
      setCurrentProject(project); // Triggers useGetAssembliesForWbsElement
      setShowCreateMaterialModal(true);
    }
  };

  const handleCloseCreateMaterial = () => {
    setShowCreateMaterialModal(false);
    setCurrentProductIndex(null);
    setCurrentProject(null);
  };

  const handleMaterialCreated = (materialName: string) => {
    if (currentProductIndex !== null) {
      setValue(`reimbursementProducts.${currentProductIndex}.name`, materialName);
      setPendingMaterialIndices((prev) => new Set(prev).add(currentProductIndex));
    }
    handleCloseCreateMaterial();
  };

  const [showFirstSourceFields, setShowFirstSourceFields] = useState(false);
  const [showSecondSourceFields, setShowSecondSourceFields] = useState(false);

  const prevFirstRefundSourceName = useRef(firstRefundSourceName);
  const prevSecondRefundSourceName = useRef(secondRefundSourceName);
  const prevHasMultipleRefundSources = useRef(hasMultipleRefundSources);

  const refundSources: CreateRefundSourceArgs[] = (() => {
    const allSources = reimbursementProducts
      .flatMap((product) => product.refundSources ?? [])
      .filter((source): source is CreateRefundSourceArgs => {
        return !!source && !!source.indexCode && !!source.indexCode.indexCodeId && Number(source.amount ?? 0) > 0;
      });

    const seen = new Set<string>();

    return allSources.filter((source) => {
      const id = source.indexCode.indexCodeId;

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);
      return true;
    });
  })();

  // in the event the data was from a prior refund request
  const hasPreFilledData = useRef(false);
  const hasInitializedRefundSources = useRef(false);

  const previousProductCount = useRef(reimbursementProducts.length);

  useEffect(() => {
    const productCountChanged = reimbursementProducts.length !== previousProductCount.current;
    previousProductCount.current = reimbursementProducts.length;

    if (!productCountChanged) return;

    const currentTotalShipping = watch('splitShipping');
    if (!currentTotalShipping || Number(currentTotalShipping) <= 0) return;

    applySplitShippingToProducts(Number(currentTotalShipping));
  }, [reimbursementProducts.length, applySplitShippingToProducts, watch]);

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
      const products = watch('reimbursementProducts') || [];
      products.forEach((product: ProductWithLocalFields, index: number) => {
        const currentCost = product.cost ?? 0;
        setValue(`reimbursementProducts.${index}.refundSources.${0}.amount`, currentCost);
        setValue(`reimbursementProducts.${index}.refundSources.${1}.amount`, 0);
      });
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
    <>
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
                Associate each item with a project, or select a category from "Other Categories" if the item is not linked to
                a project.
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
                    options={projectAutocompleteOptions}
                    onChange={(_e, value) => {
                      if (value) {
                        const newProduct: ProductWithLocalFields = {
                          reason: validateWBS(value.id),
                          name: '',
                          cost: 0,
                          refundSources: [],
                          __baseCost: 0,
                          __shippingCost: 0
                        };

                        prependProduct(newProduct);
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
                        const newProduct: ProductWithLocalFields = {
                          reason: value,
                          name: '',
                          cost: 0,
                          refundSources: [],
                          __baseCost: 0,
                          __shippingCost: 0
                        };

                        prependProduct(newProduct);
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
                        projectAutocompleteOptions
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
                        const hasWbsNum = (product.reason as WbsNumber).carNumber !== undefined;
                        const currentProduct =
                          (watch(`reimbursementProducts.${product.index}` as const) as ProductWithLocalFields) ?? {};
                        const currentShippingCost = Number(currentProduct.__shippingCost ?? 0);

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
                                  {hasWbsNum ? (
                                    <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                      {watch(`reimbursementProducts.${product.index}.materialId`) ||
                                      !watch(`reimbursementProducts.${product.index}.name`) ||
                                      pendingMaterialIndices.has(product.index) ? (
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                          <Box sx={{ flex: 1 }}>
                                            <MaterialAutocomplete
                                              wbsNum={product.reason as WbsNumber}
                                              initialValue={watch(`reimbursementProducts.${product.index}.name`)}
                                              onSelect={(material) => {
                                                if (material) {
                                                  const label = `${material.name} (${material.materialTypeName}): ${material.manufacturerName ?? 'N/A'}, ${material.manufacturerPartNumber ?? 'N/A'}`;
                                                  setValue(`reimbursementProducts.${product.index}.name`, label, {
                                                    shouldValidate: true,
                                                    shouldDirty: true
                                                  });
                                                  setValue(
                                                    `reimbursementProducts.${product.index}.materialId`,
                                                    material.materialId,
                                                    {
                                                      shouldValidate: true,
                                                      shouldDirty: true
                                                    }
                                                  );
                                                  setPendingMaterialIndices((prev) => {
                                                    const next = new Set(prev);
                                                    next.delete(product.index);
                                                    return next;
                                                  });
                                                } else {
                                                  setValue(`reimbursementProducts.${product.index}.name`, '', {
                                                    shouldValidate: true,
                                                    shouldDirty: true
                                                  });
                                                  setValue(`reimbursementProducts.${product.index}.materialId`, undefined, {
                                                    shouldValidate: true,
                                                    shouldDirty: true
                                                  });
                                                }
                                              }}
                                            />
                                          </Box>
                                          <Typography fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                                            OR
                                          </Typography>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() =>
                                              handleOpenCreateMaterial(product.index, product.reason as WbsNumber)
                                            }
                                            sx={{ whiteSpace: 'nowrap' }}
                                          >
                                            Create New Material
                                          </Button>
                                        </Box>
                                      ) : (
                                        <TextField
                                          variant="outlined"
                                          value={watch(`reimbursementProducts.${product.index}.name`)}
                                          fullWidth
                                          size="small"
                                          disabled
                                        />
                                      )}
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
                                        render={() => {
                                          const productRow =
                                            (watch(
                                              `reimbursementProducts.${product.index}` as const
                                            ) as ProductWithLocalFields) ?? {};
                                          const baseCost = Number(productRow.__baseCost ?? 0);
                                          const shippingCost = Number(productRow.__shippingCost ?? 0);
                                          const rowTotal = Number(productRow.cost ?? baseCost + shippingCost);

                                          return (
                                            <>
                                              <TextField
                                                variant="outlined"
                                                value={baseCost === 0 ? '' : baseCost}
                                                placeholder={'$ Cost'}
                                                type="number"
                                                fullWidth
                                                sx={{
                                                  '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                    WebkitAppearance: 'none',
                                                    margin: 0
                                                  },
                                                  '& input[type=number]': {
                                                    MozAppearance: 'textfield'
                                                  }
                                                }}
                                                onChange={(e) => {
                                                  const productRow =
                                                    (watch(
                                                      `reimbursementProducts.${product.index}` as const
                                                    ) as ProductWithLocalFields) ?? {};

                                                  const updatedProduct: ProductWithLocalFields = {
                                                    ...productRow,
                                                    __baseCost: e.target.value === '' ? 0 : Number(e.target.value)
                                                  };

                                                  setValue(`reimbursementProducts.${product.index}`, updatedProduct, {
                                                    shouldDirty: true
                                                  });
                                                }}
                                                onBlur={(e) => onCostBlurHandler(parseFloat(e.target.value), product.index)}
                                                error={!!errors.reimbursementProducts?.[product.index]?.cost}
                                              />
                                              {!isEditing && (
                                                <TextField
                                                  value={shippingCost === 0 ? '' : shippingCost}
                                                  variant="outlined"
                                                  size="small"
                                                  fullWidth
                                                  margin="dense"
                                                  label="Shipping"
                                                  type="number"
                                                  sx={{
                                                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                                                      {
                                                        WebkitAppearance: 'none',
                                                        margin: 0
                                                      },
                                                    '& input[type=number]': {
                                                      MozAppearance: 'textfield'
                                                    }
                                                  }}
                                                  onChange={(e) => {
                                                    const productRow =
                                                      (watch(
                                                        `reimbursementProducts.${product.index}` as const
                                                      ) as ProductWithLocalFields) ?? {};

                                                    const updatedProduct: ProductWithLocalFields = {
                                                      ...productRow,
                                                      __shippingCost: e.target.value === '' ? 0 : Number(e.target.value)
                                                    };

                                                    setValue(`reimbursementProducts.${product.index}`, updatedProduct, {
                                                      shouldDirty: true
                                                    });
                                                  }}
                                                  onBlur={(e) =>
                                                    onShippingBlurHandler(parseFloat(e.target.value), product.index)
                                                  }
                                                  helperText={`Product total $${Number(rowTotal || 0).toFixed(2)}`}
                                                />
                                              )}
                                            </>
                                          );
                                        }}
                                      />
                                      <FormHelperText error>
                                        {errors.reimbursementProducts?.[product.index]?.cost?.message}
                                      </FormHelperText>
                                    </FormControl>
                                  </Box>
                                )}
                                {hasMultipleRefundSources && (
                                  <>
                                    <Box
                                      sx={{
                                        flex: '3',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: 'grid',
                                          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                          gap: 1,
                                          width: '100%'
                                        }}
                                      >
                                        {showFirstSourceFields && (
                                          <Box>
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
                                                      field.onChange(e.target.value);
                                                    }}
                                                    variant="outlined"
                                                    placeholder={'$ Amt'}
                                                    type="number"
                                                    fullWidth
                                                    sx={{
                                                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                                                        {
                                                          WebkitAppearance: 'none',
                                                          margin: 0
                                                        },
                                                      '& input[type=number]': {
                                                        MozAppearance: 'textfield'
                                                      }
                                                    }}
                                                    onBlur={(e) =>
                                                      onAmountBlurHandler(
                                                        e.target.value,
                                                        product.index,
                                                        `refundSources.${0}.amount`
                                                      )
                                                    }
                                                    error={
                                                      !!errors.reimbursementProducts?.[product.index]?.refundSources?.[0]
                                                        ?.amount
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
                                          <Box>
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
                                                      field.onChange(e.target.value);
                                                    }}
                                                    variant="outlined"
                                                    placeholder={'$ Amt'}
                                                    type="number"
                                                    fullWidth
                                                    sx={{
                                                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                                                        {
                                                          WebkitAppearance: 'none',
                                                          margin: 0
                                                        },
                                                      '& input[type=number]': {
                                                        MozAppearance: 'textfield'
                                                      }
                                                    }}
                                                    onBlur={(e) =>
                                                      onAmountBlurHandler(
                                                        e.target.value,
                                                        product.index,
                                                        `refundSources.${1}.amount`
                                                      )
                                                    }
                                                    error={
                                                      !!errors.reimbursementProducts?.[product.index]?.refundSources?.[1]
                                                        ?.amount
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
                                      </Box>
                                      {!isEditing && (
                                        <Box sx={{ width: '100%' }}>
                                          <TextField
                                            value={currentShippingCost === 0 ? '' : currentShippingCost}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            label="Shipping"
                                            type="number"
                                            sx={{
                                              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0
                                              },
                                              '& input[type=number]': {
                                                MozAppearance: 'textfield'
                                              }
                                            }}
                                            onChange={(e) => {
                                              const currentProduct =
                                                (watch(
                                                  `reimbursementProducts.${product.index}` as const
                                                ) as ProductWithLocalFields) ?? {};

                                              const updatedProduct: ProductWithLocalFields = {
                                                ...currentProduct,
                                                __shippingCost: e.target.value === '' ? 0 : Number(e.target.value)
                                              };

                                              setValue(`reimbursementProducts.${product.index}`, updatedProduct, {
                                                shouldDirty: true
                                              });
                                            }}
                                            onBlur={(e) => onShippingBlurHandler(parseFloat(e.target.value), product.index)}
                                            helperText={`Product total $${Number(watch(`reimbursementProducts.${product.index}.cost`) || 0).toFixed(2)}`}
                                          />
                                        </Box>
                                      )}
                                    </Box>

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
                                onClick={() => {
                                  removeProduct(product.index);
                                }}
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
                          const newProduct: ProductWithLocalFields = {
                            reason: existingProducts[0].reason,
                            name: '',
                            cost: 0,
                            refundSources: [],
                            __baseCost: 0,
                            __shippingCost: 0
                          };

                          prependProduct(newProduct);
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

      {currentProject && (
        <CreateMaterialModal
          open={showCreateMaterialModal}
          onHide={handleCloseCreateMaterial}
          wbsElement={currentProject}
          onSuccess={handleMaterialCreated}
          fromRRForm
        />
      )}
    </>
  );
};

export default ReimbursementProductTable;
