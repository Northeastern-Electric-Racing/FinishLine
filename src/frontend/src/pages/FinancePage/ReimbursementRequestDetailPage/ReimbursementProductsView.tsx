import { Box, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { getUniqueWbsElementsWithProductsFromReimbursementRequest } from '../../../utils/reimbursement-request.utils';
import { ReimbursementRequest } from 'shared';
import { centsToDollar } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';

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

  const multipleRefundSources = reimbursementRequest.reimbursementProducts.some(
    (product) => product.refundSources.length > 1
  );

  const refundSourceNames: string[] = Array.from(
    new Set(
      reimbursementRequest.reimbursementProducts.flatMap((product) => product.refundSources.map((rs) => rs.indexCode.name))
    )
  );

  return (
    <>
      <Box sx={{ whiteSpace: 'nowrap' }}>
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
                  <Typography variant="h6">{refundSourceNames.join(' / ')}</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((key) => {
              return (
                <TableRow key={key}>
                  <TableCell>
                    <Box sx={{ maxWidth: '64ch', overflowWrap: 'anywhere', whiteSpace: 'normal' }}>
                      {uniqueWbsElementsWithProducts.get(key)?.map((product, index) => {
                        const bomUrl = (() => {
                          if (!product.materialId) return undefined;
                          const reason = product.reimbursementProductReason;
                          if (!('wbsNum' in reason)) return undefined;
                          return `${routes.PROJECTS}/${reason.wbsNum.carNumber}.${reason.wbsNum.projectNumber}.${reason.wbsNum.workPackageNumber}/bom`;
                        })();
                        return (
                          <div key={index}>
                            {bomUrl ? (
                              <Link href={bomUrl} underline="hover">
                                {product.name}
                              </Link>
                            ) : (
                              product.name
                            )}
                          </div>
                        );
                      })}
                    </Box>
                  </TableCell>
                  {!allKeysAreSame && <TableCell>{key}</TableCell>}
                  <TableCell>
                    {uniqueWbsElementsWithProducts.get(key)?.map((product, index) => (
                      <div key={index}>${centsToDollar(product.cost)}</div>
                    ))}
                  </TableCell>
                  {multipleRefundSources && (
                    <TableCell>
                      {uniqueWbsElementsWithProducts.get(key)?.map((product, index) => (
                        <div key={index}>{product.refundSources.map((rs) => `$${centsToDollar(rs.amount)}`).join('/')}</div>
                      ))}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};

export default ReimbursementProductsView;
