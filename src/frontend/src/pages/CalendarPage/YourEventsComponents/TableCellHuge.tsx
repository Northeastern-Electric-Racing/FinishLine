import { TableCell, Typography } from '@mui/material';

interface TableCellHugeProps {
  title: string;
}

/**
 * Build the Table Cell for the header of the table.
 * @param title The title of the table cell
 **/
const TableCellHuge: React.FC<TableCellHugeProps> = ({ title }) => {
  return (
    <TableCell
      sx={{
        backgroundColor: '#dd514c'
      }}
    >
      <Typography
        flexGrow={1}
        variant="h4"
        fontSize={25}
        sx={{
          textAlign: {
            xs: 'center',
            md: 'center'
          }
        }}
      >
        {title}
      </Typography>
    </TableCell>
  );
};

export default TableCellHuge;
