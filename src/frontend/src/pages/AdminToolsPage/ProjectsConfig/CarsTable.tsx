import { TableRow, TableCell, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { datePipe } from '../../../utils/pipes';
import ErrorPage from '../../ErrorPage';
import { NERButton } from '../../../components/NERButton';
import NERTable from '../../../components/NERTable';
import { useGetAllCars } from '../../../hooks/cars.hooks';
import CreateCarModal from './CreateCarFormModal';
import EditCarModal from './EditCarFormModal';
import { Car } from 'shared';
import { useState } from 'react';

const CarsTable: React.FC = () => {
  const { data: cars, isLoading: carsIsLoading, isError: carsIsError, error: carsError } = useGetAllCars();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  if (!cars || carsIsLoading) {
    return <LoadingIndicator />;
  }
  if (carsIsError) {
    return <ErrorPage message={carsError?.message} />;
  }

  const carsTableRows = cars.map((car, index) => (
    <TableRow>
      <TableCell sx={{ borderBottom: index === cars.length - 1 ? 'none' : 'default' }}>{car.wbsNum.carNumber}</TableCell>
      <TableCell sx={{ borderBottom: index === cars.length - 1 ? 'none' : 'default' }}>{car.name}</TableCell>
      <TableCell sx={{ borderBottom: index === cars.length - 1 ? 'none' : 'default' }}>
        {datePipe(car.dateCreated)}
      </TableCell>
      <TableCell sx={{ borderBottom: index === cars.length - 1 ? 'none' : 'default' }}>
        <IconButton onClick={() => setEditingCar(car)} size="small">
          <EditIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateCarModal showModal={openCreateModal} handleClose={() => setOpenCreateModal(false)} />
      {editingCar && (
        <EditCarModal
          showModal={!!editingCar}
          handleClose={() => setEditingCar(null)}
          carId={editingCar.id}
          carName={editingCar.name}
        />
      )}
      <NERTable
        columns={[{ name: 'Car Number' }, { name: 'Car Name' }, { name: 'Date Created' }, { name: '' }]}
        rows={carsTableRows}
      />
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
        <NERButton variant="contained" onClick={() => setOpenCreateModal(true)}>
          New Car
        </NERButton>
      </Box>
    </Box>
  );
};

export default CarsTable;
