import { TableCell } from '@mui/material';

const ColumnHeader = ({ title, uncenter }: { title: string; uncenter?: boolean }) => {
  return (
    <TableCell align={uncenter ? 'left' : 'center'} sx={{ fontSize: '16px', fontWeight: 600 }}>
      {title}
    </TableCell>
  );
};

export default ColumnHeader;
