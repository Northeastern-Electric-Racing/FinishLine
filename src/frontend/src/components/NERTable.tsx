import { Table, TableBody, TableCell, TableContainer, TableHead, TableSortLabel } from '@mui/material';

interface AdminToolTableProps {
  columns: {
    name: string;
    width?: string;
    sort?: SortLabelProps;
  }[];
  rows: JSX.Element[];
  size?: 'small' | 'medium';
}

export interface SortLabelProps {
  active?: boolean;
  direction: 'asc' | 'desc';
  onClick: () => void;
}

const NERTable = ({ columns, rows, size }: AdminToolTableProps) => {
  return (
    <TableContainer>
      <Table size={size}>
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
              <TableSortLabel {...column.sort}>{column.name}</TableSortLabel>
            </TableCell>
          ))}
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};

export default NERTable;
