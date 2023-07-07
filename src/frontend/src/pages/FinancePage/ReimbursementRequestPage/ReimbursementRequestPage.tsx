/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Chip, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { ReimbursementProduct, wbsPipe } from 'shared';
import { datePipe, fullNamePipe } from '../../../utils/pipes';
import VerticalDetailDisplay from '../../../components/VerticalDetailDisplay';
import { useSingleReimbursementRequest } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useParams } from 'react-router-dom';
import PageTitle from '../../../layouts/PageTitle/PageTitle';
import { useEffect, useRef, useState } from 'react';

interface ParamTypes {
  id: string;
}

const ReimbursementRequestPage: React.FC = () => {
  const { id } = useParams<ParamTypes>();
  const { data: reimbursementRequest } = useSingleReimbursementRequest(id);

  const ref = useRef<HTMLDivElement>(null);

  const [height, setHeight] = useState<number>(350);

  // doesnt work with the dependency array for some reason
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.clientHeight + 350);
    }
  });

  const theme = useTheme();

  if (!reimbursementRequest) return <LoadingIndicator />;

  const BasicInformationView = () => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <VerticalDetailDisplay label="Purchased From" content={reimbursementRequest.vendor.name} />
        </Grid>
        <Grid item xs={4}>
          <VerticalDetailDisplay label="Refund Source" content={`${reimbursementRequest.account}`} />
        </Grid>
        <Grid item xs={4}>
          <VerticalDetailDisplay label="Expense Type" content={`${reimbursementRequest.expenseType.name}`} />
        </Grid>
        <Grid item xs={12}>
          <VerticalDetailDisplay label="Sabo #" content={`${reimbursementRequest.saboId ?? '----'}`} />
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

    const keys = [];
    for (const key of uniqueWbsElementsWithProducts.keys()) {
      keys.push(key);
    }

    return (
      <div ref={ref}>
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
      </div>
    );
  };

  const ReceiptsView = () => {
    return (
      <Box sx={{ maxHeight: `${height!}px`, overflow: 'auto' }}>
        <Typography variant="h5">Receipts</Typography>
        {reimbursementRequest.receiptPictures.map((receipt) => {
          return (
            <iframe
              style={{ height: `${height - 20}px`, width: '100%' }}
              src={`https://drive.google.com/file/d/${receipt.googleFileId}/preview`}
              title="ollie"
            ></iframe>
          );
        })}
      </Box>
    );
  };

  return (
    <Box>
      <PageTitle
        title={`${fullNamePipe(reimbursementRequest.recipient)} - ${datePipe(new Date(reimbursementRequest.dateOfExpense))}`}
        previousPages={[]}
      ></PageTitle>
      <Grid container spacing={2} mt={2}>
        <Grid container rowSpacing={5} item md={5} xs={12}>
          <Grid item xs={12}>
            <BasicInformationView />
          </Grid>
          <Grid item xs={12}>
            <ReimbursementProductsView />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" display="inline">
              {'Total Cost: '}
            </Typography>
            <Typography variant="h5" fontWeight={'normal'} display={'inline'}>
              ${reimbursementRequest.totalCost}
            </Typography>
          </Grid>
        </Grid>
        {/*Divider*/}
        <Grid item md={1} xs={0} justifyContent={'center'} display={'flex'}>
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
        <Grid item md={5} xs={12}>
          <ReceiptsView />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReimbursementRequestPage;
