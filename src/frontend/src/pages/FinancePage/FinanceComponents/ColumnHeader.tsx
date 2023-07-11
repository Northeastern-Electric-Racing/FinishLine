import { TableCell } from '@mui/material';

const ColumnHeader = ({ title }: { title: string }) => {
  return (
    <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
      {title}
    </TableCell>
  );
};

export default ColumnHeader;
