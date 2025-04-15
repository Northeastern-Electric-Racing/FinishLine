import { TableRow, TableCell, Typography, Box, TableHead, Table, TableBody, Checkbox } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import React, { useState } from 'react';
import { IndexCode } from 'shared';

const CategoriesTable = () => {
  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodesIsError,
    error: indexCodesError
  } = useGetAllIndexCodes();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [clickedIndexCode, setClickedIndexCode] = useState<IndexCode>();

  if (!indexCodes || indexCodesIsLoading) {
    return <LoadingIndicator />;
  }

  if (indexCodesIsError) {
    return <ErrorPage message={indexCodesError.message} />;
  }

  const categoriesTableRows = indexCodes.map((indexCode, index) => (
    <TableRow
      onClick={() => {
        setClickedIndexCode(indexCode);
        setShowEditModal(true);
      }}
      key={`index-code-${index}`}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell>
        <Typography>{indexCode.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{indexCode.code}</Typography>
      </TableCell>
      <TableCell>
        <Typography>name/description here?</Typography>
      </TableCell>
      <TableCell>Budget Here?</TableCell>
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
                key={`index-code-column-${index}`}
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
