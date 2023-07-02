/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Chip, Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Box } from '@mui/system';
import { ReimbursementProduct, wbsPipe } from 'shared';
import { fullNamePipe } from '../../../utils/pipes';
import DetailDisplay from '../../../components/DetailDisplay';
import { useSingleReimbursementRequest } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useParams } from 'react-router-dom';
import PageTitle from '../../../layouts/PageTitle/PageTitle';

const ReimbursementRequestPage: React.FC = () => {
  interface ParamTypes {
    id: string;
  }
  const { id } = useParams<ParamTypes>();
  const { data: reimbursementRequest } = useSingleReimbursementRequest(id);

  if (!reimbursementRequest) return <LoadingIndicator />;

  const BasicInformationView = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <DetailDisplay label="Recipient" content={fullNamePipe(reimbursementRequest.recipient)} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Purchased From" content={reimbursementRequest.vendor.name} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Refund Source" content={`${reimbursementRequest.account}`} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Date of Expense" content={`${reimbursementRequest.dateOfExpense}`} />
        </Grid>
        <Grid item xs={12}>
          <DetailDisplay label="Expense Type" content={`${reimbursementRequest.expenseType.name}`} />
        </Grid>
      </Grid>
    );
  };

  const ReimbursementProductsView = () => {
    const uniqueWbsElementsWithProducts = new Map<String, ReimbursementProduct[]>();
    reimbursementRequest.reimbursementProducts.forEach((product) => {
      const wbs = wbsPipe(product.wbsNum);
      if (uniqueWbsElementsWithProducts.has(wbs)) {
        const products = uniqueWbsElementsWithProducts.get(wbs);
        products?.push(product);
      } else {
        uniqueWbsElementsWithProducts.set(wbs, [product]);
      }
    });

    console.log(uniqueWbsElementsWithProducts);

    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>WBS Element</TableCell>
            <TableCell>Products</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {uniqueWbsElementsWithProducts.forEach((products, wbs) => {
            console.log(wbs);
            
              return <TableRow>
                <TableCell>{wbs}</TableCell>
                <TableCell>
                  {products.map((product) => {
                    return <Chip label={product.name} />;
                  })}
                </TableCell>
              </TableRow>
            
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <PageTitle title="Reimbursement Request" previousPages={[]}></PageTitle>
      <Box>
        <BasicInformationView />
        <ReimbursementProductsView />
      </Box>
    </>
  );
};

export default ReimbursementRequestPage;
