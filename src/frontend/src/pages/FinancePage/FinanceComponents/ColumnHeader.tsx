import { TableCell } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { ReimbursementRequestRow } from '../../../../../shared/src/types/reimbursement-requests-types';
import TableSortLabel from '@mui/material/TableSortLabel';

const ColumnHeader = ({
  leftAlign = false,
  id,
  title,
  setAscendingOrder,
  isAscendingOrder,
  setOrderBy,
  orderBy
}: {
  leftAlign?: boolean;
  id?: keyof ReimbursementRequestRow;
  title: string;
  setAscendingOrder?: Dispatch<SetStateAction<boolean>>;
  isAscendingOrder?: boolean;
  setOrderBy?: Dispatch<SetStateAction<keyof ReimbursementRequestRow>>;
  orderBy?: keyof ReimbursementRequestRow;
}) => {
  const handleRequestSort = (property: keyof ReimbursementRequestRow) => {
    if (setAscendingOrder !== undefined && setOrderBy !== undefined) {
      setAscendingOrder(!isAscendingOrder);
      setOrderBy(property);
    }
  };

  if (id === undefined) {
    return (
      <TableCell align={leftAlign ? 'left' : 'center'} sx={{ fontSize: '16px', fontWeight: 600 }}>
        {title}
      </TableCell>
    );
  } else {
    return (
      <TableCell
        align={leftAlign ? 'left' : 'center'}
        sx={{ fontSize: '16px', fontWeight: 600 }}
        sortDirection={orderBy === id ? (isAscendingOrder ? 'asc' : 'desc') : false}
        style={{ paddingLeft: '42px' }}
      >
        <TableSortLabel
          active={orderBy === id}
          direction={orderBy === id ? (isAscendingOrder ? 'asc' : 'desc') : 'asc'}
          onClick={() => handleRequestSort(id)}
        >
          {title}
        </TableSortLabel>
      </TableCell>
    );
  }
};

export default ColumnHeader;
