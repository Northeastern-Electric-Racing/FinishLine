import { TableCell } from '@mui/material';

const ColumnHeader = ({ title, leftAlign = false }: { title: string; leftAlign?: boolean }) => {
  return (
    <TableCell align={leftAlign ? 'left' : 'center'} sx={{ fontSize: '16px', fontWeight: 600 }}>
      {title}
    </TableCell>
  );
};

export default ColumnHeader;
