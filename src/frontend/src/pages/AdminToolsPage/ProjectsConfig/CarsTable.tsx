import { TableRow, TableCell, Box } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import AdminToolTable from '../AdminToolTable';
import { useGetAllCars } from '../../../hooks/cars.hooks';
import CreateCarModal from './CreateCarFormModal';
import { useState } from 'react';

const CarsTable: React.FC = () => {
  const { data: cars, isLoading: carsIsLoading, isError: carsIsError, error: carsError } = useGetAllCars();

  const [openModal, setOpenModal] = useState(false);

  if (!cars || carsIsLoading) {
    return <LoadingIndicator />;
  }
  if (carsIsError) {
    return <ErrorPage message={carsError?.message} />;
  }

  const carsTableRows = cars.map((car) => (
    <TableRow>
      <TableCell sx={{ border: '2px solid black' }}>{car.wbsNum.carNumber}</TableCell>
      <TableCell sx={{ border: '2px solid black' }}>{car.name}</TableCell>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {datePipe(car.dateCreated)}
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateCarModal showModal={openModal} handleClose={() => setOpenModal(false)} />
      <AdminToolTable
        columns={[{ name: 'Car Number' }, { name: 'Car Name' }, { name: 'Date Created' }]}
        rows={carsTableRows}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenModal(true)}>
          New Car
        </NERButton>
      </Box>
    </Box>
  );
};

export default CarsTable;
