import { TableRow, TableCell, Typography, Box, TableHead, Table, TableBody, Checkbox } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllIndexCodes, useGetAllOtherProductReason } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import React, { useState } from 'react';
import { IndexCode, OtherProductReason } from 'shared';

const CategoriesTable = () => {
  const {
    data: categories,
    isLoading: categoriesIsLoading,
    isError: categoriesIsError,
    error: categoriesError
  } = useGetAllOtherProductReason();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clickedCategory, setClickedCategory] = useState<OtherProductReason>();

  if (!categories || categoriesIsLoading) {
    return <LoadingIndicator />;
  }

  if (categoriesIsError) {
    return <ErrorPage message={categoriesError.message} />;
  }

  const uniqueAccountCodeNames = (category: OtherProductReason) => {
    const uniqueNames = new Set();
    category.accountCodes.forEach((accountCode) => uniqueNames.add(accountCode.code));
    return Array.from(uniqueNames).join(', ');
  };

  const categoriesTableRows = categories.map((category, index) => (
    <TableRow
      onClick={() => {
        setClickedCategory(category);
        setShowEditModal(true);
      }}
      key={`category-${index}`}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Typography>{category.indexCode.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{uniqueAccountCodeNames(category)}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{category.name}</Typography>
      </TableCell>
      <TableCell>{`$${category.budget}`}</TableCell>
    </TableRow>
  ));

  const columns = ['Index Code', 'Account Code', 'Name', 'Budget'];

  return (
    <Box>
      {/* <CreateIndexCodeModal showModal={showCreateModal} handleClose={() => setShowCreateModal(false)} />
      {clickedIndexCode && (
        <EditIndexCodeModal
          showModal={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setClickedIndexCode(undefined);
          }}
          indexCode={clickedIndexCode}
        />
      )} */}
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
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setShowCreateModal(true);
          }}
        >
          Add Category
        </NERButton>
      </Box>
    </Box>
  );
};

export default CategoriesTable;
