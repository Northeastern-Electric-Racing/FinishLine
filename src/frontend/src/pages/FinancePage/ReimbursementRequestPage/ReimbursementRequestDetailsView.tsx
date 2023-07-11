/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Chip, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { ReimbursementProduct, ReimbursementRequest, wbsPipe } from 'shared';
import { datePipe, fullNamePipe } from '../../../utils/pipes';
import VerticalDetailDisplay from '../../../components/VerticalDetailDisplay';
import PageLayout from '../../../components/PageLayout';

interface ReimbursementRequestDetailsViewProps {
  reimbursementRequest: ReimbursementRequest;
}

const ReimbursementRequestDetailsView: React.FC<ReimbursementRequestDetailsViewProps> = ({ reimbursementRequest }) => {
  const theme = useTheme();
  const totalCostBackgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];

  const BasicInformationView = () => {
    return (
      <>
        <Typography variant="h6">Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Purchased From" content={reimbursementRequest.vendor.name} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Sabo Number" content={`${reimbursementRequest.saboId ?? '----'}`} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Refund Source" content={`${reimbursementRequest.account}`} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Expense Type" content={`${reimbursementRequest.expenseType.name}`} />
          </Grid>
          <Grid
            item
            xs={12}
            container
            mt={2}
            ml={2}
            sx={{ backgroundColor: totalCostBackgroundColor, borderRadius: '10px' }}
          >
            <Grid item xs={6} textAlign={'center'}>
              <Typography fontSize={50}>Total Cost</Typography>
            </Grid>
            <Grid xs={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography fontSize={50}>{`$${reimbursementRequest.totalCost}`}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </>
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

    const keys = [];
    for (const key of uniqueWbsElementsWithProducts.keys()) {
      keys.push(key);
    }

    return (
      <>
        <Typography variant="h5">Products</Typography>
        <Table component={Paper}>
          <TableHead>
            <TableRow>
              <TableCell>WBS Element</TableCell>
              <TableCell>Products</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((key) => {
              return (
                <TableRow>
                  <TableCell>{key}</TableCell>
                  <TableCell>
                    {uniqueWbsElementsWithProducts.get(key)?.map((product) => {
                      return <Chip label={`${product.name} $${product.cost}`} />;
                    })}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </>
    );
  };

  const ReceiptsView = () => {
    return (
      <Box sx={{ maxHeight: `250px`, overflow: 'auto' }}>
        <Typography variant="h5">Receipts</Typography>
        {reimbursementRequest.receiptPictures.map((receipt) => {
          return (
            <iframe
              style={{ height: `200px`, width: '50%' }}
              src={`https://drive.google.com/file/d/${receipt.googleFileId}/preview`}
              title="ollie"
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      <PageLayout
        title={`${fullNamePipe(reimbursementRequest.recipient)} - ${datePipe(new Date(reimbursementRequest.dateOfExpense))}`}
        previousPages={[]}
      />
      <Grid container spacing={2} mt={2}>
        <Grid item lg={6} xs={12}>
          <BasicInformationView />
        </Grid>
        {/*Divider*/}
        <Grid item lg={1} xs={0} justifyContent={'center'} display={'flex'}>
          <Box
            sx={{
              height: '100%',
              borderColor: theme.palette.divider,
              borderWidth: '2px',
              borderStyle: 'solid',
              width: '0px',
              textAlign: 'center'
            }}
          />
        </Grid>
        <Grid item lg={4} xs={12} rowSpacing={5} container>
          <Grid item xs={12}>
            <ReceiptsView />
          </Grid>
          <Grid item xs={12}>
            <ReimbursementProductsView />
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReimbursementRequestDetailsView;
