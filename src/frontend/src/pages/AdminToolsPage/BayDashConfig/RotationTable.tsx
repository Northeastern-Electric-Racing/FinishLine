/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetBayDashboardRotations } from '../../../hooks/bay-dashboard.hooks';
import ErrorPage from '../../ErrorPage';
import { headerCellSx } from './CountdownTable';

interface RotationTableProps {
  slug: string;
}

const RotationTable: React.FC<RotationTableProps> = ({ slug }) => {
  const { data: rotations, isLoading, isError, error } = useGetBayDashboardRotations(slug);

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !rotations) return <LoadingIndicator />;

  return (
    <Box>
      <Table sx={{ '& td': { borderBottom: 'none' } }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...headerCellSx, borderRadius: '10px 0px 0px 0px' }}>
              Widget
            </TableCell>
            <TableCell align="center" sx={{ ...headerCellSx, borderRadius: '0px 10px 0px 0px' }}>
              Time Rotation
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rotations.map((rotation) => (
            <TableRow key={rotation.bayDashboardRotationId}>
              <TableCell align="center">{rotation.size}</TableCell>
              <TableCell align="center">{rotation.rotationSeconds}s</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default RotationTable;
