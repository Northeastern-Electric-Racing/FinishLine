import { Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { getUniqueWbsElementsWithProductsFromReimbursementRequest } from '../../../utils/reimbursement-request.utils';
import { ReimbursementRequest } from 'shared';
import { centsToDollar, displayEnum } from '../../../utils/pipes';

interface ReimbursementRequestProductsViewProps {
  reimbursementRequest: ReimbursementRequest;
}

const ReimbursementProductsView: React.FC<ReimbursementRequestProductsViewProps> = ({ reimbursementRequest }) => {
  const uniqueWbsElementsWithProducts = getUniqueWbsElementsWithProductsFromReimbursementRequest(reimbursementRequest);

  const keys: string[] = [];
  for (const key of uniqueWbsElementsWithProducts.keys()) {
    keys.push(key);
  }

  const allKeysAreSame = keys.length === 0 || keys.every((key) => key === keys[0]);

  // Placeholder until support for multiple refund sources is available
  // Currently, does not seem to be the case
  const multipleRefundSources = false;

  return (
    <>
      <Typography variant="h5">Products</Typography>
      <Table sx={{ maxWidth: 500 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6">Item</Typography>
            </TableCell>
            {!allKeysAreSame && (
              <TableCell>
                <Typography variant="h6">Project</Typography>
              </TableCell>
            )}
            <TableCell>
              <Typography variant="h6">Cost</Typography>
            </TableCell>
            {multipleRefundSources && (
              <TableCell>
                <Typography variant="h6">Bud/Cash</Typography>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {keys.map((key) => {
            return (
              <TableRow key={key}>
                <TableCell>
                  {uniqueWbsElementsWithProducts.get(key)?.map((product) => {
                    return product.name;
                  })}
                </TableCell>
                {!allKeysAreSame && <TableCell>{displayEnum(key)}</TableCell>}
                <TableCell>
                  {uniqueWbsElementsWithProducts.get(key)?.map((product) => {
                    return `$${centsToDollar(product.cost)}`;
                  })}
                </TableCell>
                {multipleRefundSources && <TableCell></TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default ReimbursementProductsView;
