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
import { OtherProductReason, ReimbursementProductCreateArgs, WbsNumber, validateWBS, wbsPipe } from 'shared';
import { Add, Delete } from '@mui/icons-material';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';

const otherCategoryOptions = [
  { label: 'Competition', id: 'COMPETITION' },
  { label: 'Consumeables', id: 'CONSUMABLES' },
  { label: 'General Stock', id: 'GENERAL_STOCK' },
  { label: 'Subscriptions and Memberships', id: 'SUBSCRIPTIONS_AND_MEMBERSHIPS' },
  { label: 'Tools and Equipment', id: 'TOOLS_AND_EQUIPMENT' }
];

interface ReimbursementProductTableProps {
  reimbursementProducts: ReimbursementProductCreateArgs[];
  removeProduct: (index: number) => void;
  appendProduct: (args: ReimbursementProductCreateArgs) => void;
  wbsElementAutocompleteOptions: {
    label: string;
    id: string;
  }[];
  errors: FieldErrors<ReimbursementRequestFormInput>;
  control: Control<ReimbursementRequestFormInput, any>;
  setValue: UseFormSetValue<ReimbursementRequestFormInput>;
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
  setValue
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
      products?.push({ ...product, index: index });
    } else {
      uniqueWbsElementsWithProducts.set(productReason, [{ ...product, index: index }]);
    }
  });

  const onCostBlurHandler = (value: number, index: number) => {
    setValue(`reimbursementProducts.${index}.cost`, parseFloat(value.toFixed(2)));
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={'40%'}>
              <FormLabel>Project/Category</FormLabel>
            </TableCell>
            <TableCell width={'60%'}>
              <FormLabel>Products</FormLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(uniqueWbsElementsWithProducts.keys()).map((key) => {
            return (
              <TableRow key={key}>
                <TableCell>
                  <Typography>
                    {wbsElementAutocompleteOptions.concat(otherCategoryOptions).find((value) => value.id === key)?.label}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', p: 0.5, m: 0 }} component={'ul'}>
                    {uniqueWbsElementsWithProducts.get(key)?.map((product, index) => (
                      <ListItem key={product.index}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                          <FormControl sx={{ width: '50%', marginRight: '4px' }}>
                            <Controller
                              name={`reimbursementProducts.${product.index}.name`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label={'Description'}
                                  autoComplete="off"
                                  size={'small'}
                                  variant={'outlined'}
                                  sx={{ width: '100%' }}
                                  error={!!errors.reimbursementProducts?.[product.index]?.name}
                                />
                              )}
                            />
                            <FormHelperText error>
                              {errors.reimbursementProducts?.[product.index]?.name?.message}
                            </FormHelperText>
                          </FormControl>
                          <FormControl sx={{ width: '50%' }}>
                            <Controller
                              name={`reimbursementProducts.${product.index}.cost`}
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label={'Cost'}
                                  size={'small'}
                                  variant={'outlined'}
                                  type="number"
                                  autoComplete="off"
                                  InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                                  }}
                                  onBlur={(e) => onCostBlurHandler(parseFloat(e.target.value), product.index)}
                                  sx={{ width: '100%' }}
                                  error={!!errors.reimbursementProducts?.[product.index]?.cost}
                                />
                              )}
                            />
                            <FormHelperText error>
                              {errors.reimbursementProducts?.[product.index]?.cost?.message}
                            </FormHelperText>
                          </FormControl>
                          <IconButton onClick={() => removeProduct(product.index)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </Box>
                  <Button
                    sx={{ margin: '4px' }}
                    startIcon={<Add />}
                    onClick={() =>
                      appendProduct({
                        reason: key.includes('.') ? validateWBS(key) : (key as OtherProductReason),
                        name: '',
                        cost: 0
                      })
                    }
                  >
                    Add Product
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell colSpan={2} sx={{ borderBottom: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'horizontal', gap: '5px' }}>
                <Autocomplete
                  fullWidth
                  sx={{ my: 1 }}
                  options={wbsElementAutocompleteOptions}
                  onChange={(_event, value) => {
                    if (value) {
                      appendProduct({
                        reason: validateWBS(value.id),
                        name: '',
                        cost: 0
                      });
                    }
                  }}
                  value={null}
                  blurOnSelect={true}
                  id={'append-product-autocomplete'}
                  size={'small'}
                  renderInput={(params) => <TextField {...params} placeholder="Select Project" />}
                />
                <Autocomplete
                  fullWidth
                  sx={{ my: 1 }}
                  options={otherCategoryOptions}
                  onChange={(_event, value) => {
                    if (value) {
                      appendProduct({
                        reason: value.id as OtherProductReason,
                        name: '',
                        cost: 0
                      });
                    }
                  }}
                  value={null}
                  blurOnSelect={true}
                  id={'append-product-autocomplete'}
                  size={'small'}
                  renderInput={(params) => <TextField {...params} placeholder="Select Other Category" />}
                />
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReimbursementProductTable;
