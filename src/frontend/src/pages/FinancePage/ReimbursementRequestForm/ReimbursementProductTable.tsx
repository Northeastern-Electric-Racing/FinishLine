/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Autocomplete,
  Button,
  FormControl,
  FormLabel,
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
import { OtherProductReason, WbsNumber, validateWBS, wbsPipe, ReimbursementProductFormArgs } from 'shared';
import { Add, Delete, RemoveCircleOutline, AddCircleOutline } from '@mui/icons-material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';
import { useTheme } from '@mui/system';

const otherCategoryOptions = [
  { label: 'Competition', id: 'COMPETITION' },
  { label: 'Consumeables', id: 'CONSUMABLES' },
  { label: 'General Stock', id: 'GENERAL_STOCK' },
  { label: 'Subscriptions and Memberships', id: 'SUBSCRIPTIONS_AND_MEMBERSHIPS' },
  { label: 'Tools and Equipment', id: 'TOOLS_AND_EQUIPMENT' }
];

interface ReimbursementProductTableProps {
  reimbursementProducts: ReimbursementProductFormArgs[];
  removeProduct: (index: number) => void;
  appendProduct: (args: ReimbursementProductFormArgs) => void;
  wbsElementAutocompleteOptions: {
    label: string;
    id: string;
  }[];
  errors: FieldErrors<ReimbursementRequestFormInput>;
  control: Control<ReimbursementRequestFormInput>;
  setValue: UseFormSetValue<ReimbursementRequestFormInput>;
  hasMultipleRefundSources?: boolean;
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
  hasMultipleRefundSources = false
}) => {
  const uniqueWbsElementsWithProducts = new Map<
    string,
    {
      name: string;
      cost: number;
      index: number;
    }[]
  >();
  reimbursementProducts.forEach((product, index) => {
    const hasWbsNum = (product.reason as WbsNumber).carNumber !== undefined;
    const productReason = hasWbsNum ? wbsPipe(product.reason as WbsNumber) : (product.reason as string);
    if (uniqueWbsElementsWithProducts.has(productReason)) {
      const products = uniqueWbsElementsWithProducts.get(productReason);
      products?.push({ ...product, index });
    } else {
      uniqueWbsElementsWithProducts.set(productReason, [{ ...product, index }]);
    }
  });

  const onCostBlurHandler = (value: number, index: number) => {
    setValue(`reimbursementProducts.${index}.cost`, parseFloat(value.toFixed(2)));
  };

  const userTheme = useTheme();
  const hoverColor = userTheme.palette.action.hover;

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
                  onChange={(_event, value) => {
                    if (value) {
                      appendProduct({
                        reason: validateWBS(value.id),
                        name: '',
                        cost: 0,
                        budgetAmount: 0,
                        cashAmount: 0
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
                    />
                  )}
                />
                <Autocomplete
                  fullWidth
                  options={otherCategoryOptions}
                  onChange={(_event, value) => {
                    if (value) {
                      appendProduct({
                        reason: value.id as OtherProductReason,
                        name: '',
                        cost: 0,
                        budgetAmount: 0,
                        cashAmount: 0
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
                    {wbsElementAutocompleteOptions.concat(otherCategoryOptions).find((value) => value.id === key)?.label}
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
                      <Box
                        sx={{
                          flex: '2',
                          width: '100%'
                        }}
                      ></Box>
                      {hasMultipleRefundSources && (
                        <>
                          <Box sx={{ flex: '1.5', textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                            <label>Budget</label>
                          </Box>
                          <Box sx={{ flex: '1.5', textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
                            <label>Cash</label>
                          </Box>
                          <Box sx={{ width: '40px' }}></Box>
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
                            <Box
                              sx={{
                                flex: '2',
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
                                      placeholder={'Cost'}
                                      variant={'outlined'}
                                      type="number"
                                      fullWidth
                                      autoComplete="off"
                                      InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>
                                      }}
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
                            {hasMultipleRefundSources && (
                              <>
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
                                    <Typography>Budget</Typography>
                                  </Box>
                                  <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                    <Controller
                                      name={`reimbursementProducts.${product.index}.budgetAmount`}
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
                                          placeholder={'Amt'}
                                          variant={'outlined'}
                                          type="number"
                                          fullWidth
                                          autoComplete="off"
                                          InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                          }}
                                        />
                                      )}
                                    />
                                  </FormControl>
                                </Box>
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
                                    <Typography>Cash</Typography>
                                  </Box>
                                  <FormControl fullWidth margin="dense" variant="outlined" size="small">
                                    <Controller
                                      name={`reimbursementProducts.${product.index}.cashAmount`}
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
                                          placeholder={'Amt'}
                                          variant={'outlined'}
                                          type="number"
                                          fullWidth
                                          autoComplete="off"
                                          InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>
                                          }}
                                        />
                                      )}
                                    />
                                  </FormControl>
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
                              marginTop: { xs: '10px', md: '8px' },
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
                        reason: key.includes('.') ? validateWBS(key) : (key as OtherProductReason),
                        name: '',
                        cost: 0,
                        budgetAmount: 0,
                        cashAmount: 0
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
