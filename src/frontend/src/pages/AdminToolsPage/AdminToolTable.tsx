import { Paper, Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material';

interface AdminToolTableProps {
  columns: {
    name: string;
    width?: string;
  }[];
  rows: JSX.Element[];
}

const AdminToolTable = ({ columns, rows }: AdminToolTableProps) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          {columns.map((column, idx) => (
            <TableCell
              key={`${column.name}-${idx}`}
              align="left"
              sx={{ fontSize: '16px', fontWeight: 600, border: '2px solid black' }}
              width={column.width}
            >
              {column.name}
            </TableCell>
          ))}
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminToolTable;
