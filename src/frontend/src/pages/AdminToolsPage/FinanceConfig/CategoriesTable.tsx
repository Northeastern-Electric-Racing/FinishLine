import { TableRow, TableCell, Typography, Box, TableHead, Table, TableBody, IconButton } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllOtherProductReason } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import React, { useState } from 'react';
import { OtherProductReason } from 'shared';
import CreateCategoryModal from './CreateCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { centsToDollar, displayEnum } from '../../../utils/pipes';

const CategoriesTable = () => {
  const {
    data: categories,
    isLoading: categoriesIsLoading,
    isError: categoriesIsError,
    error: categoriesError
  } = useGetAllOtherProductReason();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [clickedCategory, setClickedCategory] = useState<OtherProductReason>();
  const [categoryToDelete, setCategoryToDelete] = useState<OtherProductReason | undefined>(undefined);

  if (!categories || categoriesIsLoading) {
    return <LoadingIndicator />;
  }

  if (categoriesIsError) {
    return <ErrorPage message={categoriesError.message} />;
  }

  const uniqueAccountCodeNames = (category: OtherProductReason) => {
    const uniqueNames = new Set(category.accountCodes.map((accountCode) => accountCode.code));
    return Array.from(uniqueNames).join(', ');
  };

  const categoriesTableRows = categories.map((category, index) => (
    <TableRow
      onClick={() => {
        setClickedCategory(category);
      }}
      key={`category-${index}`}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell sx={{ borderBottom: index === categories.length - 1 ? 'none' : 'default' }}>
        <Typography>{category.indexCode.name}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === categories.length - 1 ? 'none' : 'default' }}>
        <Typography>{uniqueAccountCodeNames(category)}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === categories.length - 1 ? 'none' : 'default' }}>
        <Typography>{displayEnum(category.name)}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === categories.length - 1 ? 'none' : 'default' }}>
        <Typography>{`$${centsToDollar(category.budget)}`}</Typography>
      </TableCell>
      <TableCell sx={{ borderBottom: index === categories.length - 1 ? 'none' : 'default' }}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setCategoryToDelete(category);
          }}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  const columns = ['Index Code', 'Account Code', 'Name', 'Budget', 'Actions'];

  return (
    <Box>
      <CreateCategoryModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {clickedCategory && (
        <EditCategoryModal
          showModal={!!clickedCategory}
          handleClose={() => {
            setClickedCategory(undefined);
          }}
          category={clickedCategory}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'left', marginTop: '20px', paddingBottom: '20px' }}>
        <Typography variant="h5" gutterBottom color="white" paddingRight={'20px'}>
          Reimbursement Categories
        </Typography>
        <NERButton
          style={{ color: 'white' }}
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          Add Category
        </NERButton>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <TableCell
                key={`category-column-${index}`}
                sx={{
                  borderBottom: '2px solid white',
                  fontWeight: 'bold',
                  fontSize: '1em',
                  backgroundColor: '#ef4345',
                  color: 'white',
                  borderRadius: index === 0 ? '10px 0px 0px 0px' : index === columns.length - 1 ? '0px 10px 0px 0px' : '0px'
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>{categoriesTableRows} </TableBody>
      </Table>
      {categoryToDelete && (
        <DeleteCategoryModal
          handleClose={() => {
            setCategoryToDelete(undefined);
          }}
          category={categoryToDelete}
        />
      )}
    </Box>
  );
};

export default CategoriesTable;
