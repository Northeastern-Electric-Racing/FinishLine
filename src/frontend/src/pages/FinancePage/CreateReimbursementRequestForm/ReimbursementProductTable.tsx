/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Autocomplete,
  Chip,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  styled
} from '@mui/material';
import { ClubAccount, ReimbursementProductCreateArgs, validateWBS, wbsPipe } from 'shared';
import { Add, Delete } from '@mui/icons-material';
import { Box } from '@mui/system';
import { Control, Controller } from 'react-hook-form';

interface ReimbursementProductTableProps {
  reimbursementProducts: ReimbursementProductCreateArgs[];
  removeProduct: (index: number) => void;
  appendProduct: (args: ReimbursementProductCreateArgs) => void;
  wbsElementAutocompleteOptions: {
    label: string;
    id: string;
  }[];
  control: Control<
    {
      vendorId: string;
      account: ClubAccount;
      dateOfExpense: Date;
      expenseTypeId: string;
      reimbursementProducts: ReimbursementProductCreateArgs[];
      receiptFiles: {
        file: File;
      }[];
      totalCost: number;
    },
    any
  >;
}

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5)
}));

const ReimbursementProductTable: React.FC<ReimbursementProductTableProps> = ({
  reimbursementProducts,
  removeProduct,
  appendProduct,
  wbsElementAutocompleteOptions,
  control
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell width={'200px'}>WBS Element</TableCell>
            <TableCell>Products</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(uniqueWbsElementsWithProducts.keys()).map((key) => {
            return (
              <TableRow>
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
                            <Grid item>
                              <Controller
                                name={`reimbursementProducts.${product.index}.name`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label={'Description'}
                                    size={'small'}
                                    variant={'outlined'}
                                    sx={{ width: '200px' }}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item>
                              <Controller
                                name={`reimbursementProducts.${product.index}.cost`}
                                control={control}
                                render={({ field }) => (
                                  <TextField
                                    {...field}
                                    label={'Amount'}
                                    size={'small'}
                                    variant={'outlined'}
                                    sx={{ width: '100px' }}
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
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      appendProduct({
                        wbsNum: validateWBS(key),
                        name: '',
                        cost: 0
                      })
                    }
                  >
                    <Add />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell colSpan={2}>
              <Autocomplete
                fullWidth
                sx={{ my: 1 }}
                options={wbsElementAutocompleteOptions}
                onChange={(event, value) => {
                  if (value) appendProduct({ wbsNum: validateWBS(value.id), name: '', cost: 0 });
                }}
                id={'append-product-autocomplete'}
                size={'small'}
                placeholder={'Select a wbs number'}
                renderInput={(params) => <TextField {...params} />}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReimbursementProductTable;
