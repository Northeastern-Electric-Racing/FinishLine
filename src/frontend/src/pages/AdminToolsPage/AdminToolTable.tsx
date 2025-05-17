import { Table, TableBody, TableCell, TableContainer, TableHead } from '@mui/material';

interface AdminToolTableProps {
  columns: {
    name: string;
    width?: string;
  }[];
  rows: JSX.Element[];
}

const AdminToolTable = ({ columns, rows }: AdminToolTableProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          {columns.map((column, idx) => (
            <TableCell
              key={`${column.name}-${idx}`}
              align="left"
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: idx === 0 ? '10px 0px 0px 0px' : idx === columns.length - 1 ? '0px 10px 0px 0px' : '0px'
              }}
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
