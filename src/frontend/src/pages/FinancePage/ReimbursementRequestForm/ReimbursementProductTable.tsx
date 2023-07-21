/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Autocomplete,
  Button,
  FormLabel,
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
  Box,
  Chip,
  Grid
} from '@mui/material';
import { ReimbursementProductCreateArgs, validateWBS, wbsPipe } from 'shared';
import { Add, Delete } from '@mui/icons-material';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { ReimbursementRequestFormInput } from './ReimbursementRequestForm';

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
  errors
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
    const wbs = wbsPipe(product.wbsNum);
    if (uniqueWbsElementsWithProducts.has(wbs)) {
      const products = uniqueWbsElementsWithProducts.get(wbs);
      products?.push({ ...product, index: index });
    } else {
      uniqueWbsElementsWithProducts.set(wbs, [{ ...product, index: index }]);
    }
  });

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={'40%'}>
              <FormLabel>WBS Element</FormLabel>
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
                  <Typography>{wbsElementAutocompleteOptions.find((value) => value.id === key)!.label}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', listStyle: 'none', p: 0.5, m: 0 }} component={'ul'}>
                    {uniqueWbsElementsWithProducts.get(key)?.map((product, index) => {
                      return product.name.length > 0 && product.cost > 0 ? (
                        <ListItem key={product.index}>
                          <Chip label={`${product.name} - $${product.cost}`} onDelete={() => removeProduct(index)} />
                        </ListItem>
                      ) : (
                        <ListItem key={product.index}>
                          <Grid container spacing={1}>
                            <Grid item md={6} xs={12}>
                              <Controller
                                name={`reimbursementProducts.${product.index}.name`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label={'Description'}
                                    size={'small'}
                                    variant={'outlined'}
                                    error={!!errors.reimbursementProducts?.[product.index]?.name}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item md={6} xs={12} display={'flex'}>
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
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                                    }}
                                    error={!!errors.reimbursementProducts?.[product.index]?.cost}
                                  />
                                )}
                              />
                              <IconButton onClick={() => removeProduct(product.index)}>
                                <Delete />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </ListItem>
                      );
                    })}
                  </Box>
                  <Button
                    sx={{ margin: '4px' }}
                    startIcon={<Add />}
                    onClick={() =>
                      appendProduct({
                        wbsNum: validateWBS(key),
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
              <Autocomplete
                fullWidth
                sx={{ my: 1 }}
                options={wbsElementAutocompleteOptions}
                onChange={(_event, value) => {
                  if (value) appendProduct({ wbsNum: validateWBS(value.id), name: '', cost: 0 });
                }}
                id={'append-product-autocomplete'}
                size={'small'}
                renderInput={(params) => <TextField {...params} placeholder="Select a Wbs Element" />}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReimbursementProductTable;
