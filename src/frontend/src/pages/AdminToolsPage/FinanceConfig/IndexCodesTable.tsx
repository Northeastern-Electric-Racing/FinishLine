import { Box, TableCell, TableRow, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { useState } from 'react';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import { IndexCode } from 'shared';
import EditIndexCodeModal from './EditIndexCodeModal';

const IndexCodesTable: React.FC = () => {
  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodesIsError,
    error: indexCodesError
  } = useGetAllIndexCodes();

  const [indexCodeToEdit, setIndexCodeToEdit] = useState<IndexCode | null>(null);

  if (!indexCodes || indexCodesIsLoading) {
    return <LoadingIndicator />;
  }
  if (indexCodesIsError) {
    return <ErrorPage message={indexCodesError?.message} />;
  }

  const indexCodeTableRows = indexCodes.map((indexCode, index) => (
    <TableRow key={indexCode.indexCodeId} hover sx={{ cursor: 'pointer' }}>
      <TableCell
        sx={{ borderBottom: index === indexCodes.length - 1 ? 'none' : 'default' }}
        onClick={() => {
          setIndexCodeToEdit(indexCode);
        }}
      >
        <Typography>{indexCode.name}</Typography>
      </TableCell>
      <TableCell
        sx={{ borderBottom: index === indexCodes.length - 1 ? 'none' : 'default' }}
        onClick={() => {
          setIndexCodeToEdit(indexCode);
        }}
      >
        <Typography>{indexCode.code}</Typography>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'left', marginTop: '20px', paddingBottom: '20px' }}>
        <Typography variant="h5" gutterBottom color="white">
          Index Codes
        </Typography>
      </Box>
      {indexCodeToEdit && (
        <EditIndexCodeModal
          showModal={!!indexCodeToEdit}
          handleClose={() => setIndexCodeToEdit(null)}
          indexCode={indexCodeToEdit}
        />
      )}
      <AdminToolTable
        columns={[
          { name: 'Name', width: '50%' },
          { name: 'Code', width: '50%' }
        ]}
        rows={indexCodeTableRows}
      />
    </Box>
  );
};

export default IndexCodesTable;
