import { DesignReview } from 'shared';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ColumnHeader from '../FinancePage/FinanceComponents/ColumnHeader';
import { fullNamePipe } from '../../utils/pipes';

interface DesignReviewAvailabilityInfoProps {
  designReview: DesignReview;
}

export const DesignReviewAvailabilityInfo: React.FC<DesignReviewAvailabilityInfoProps> = ({ designReview }) => {
  return (
    <Grid container columnSpacing={4} rowSpacing={2} marginTop="10px">
      <Grid item>
        <TableContainer>
          <Table>
            <TableHead>
              <Typography fontWeight={'bold'} fontSize="20px" marginLeft={'10px'}>
                Required
              </Typography>
              <TableRow>
                <ColumnHeader leftAlign title="Name" />
                <ColumnHeader leftAlign title="Confirmed?" />
              </TableRow>
            </TableHead>
            <TableBody>
              {designReview.requiredMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell align="left">
                    <Typography>{fullNamePipe(member)}</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      {designReview.confirmedMembers.some((confirmedMember) => confirmedMember.userId === member.userId)
                        ? 'Yes'
                        : 'No'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid item>
        <TableContainer>
          <Table>
            <TableHead>
              <Typography fontWeight={'bold'} fontSize="20px" marginLeft={'10px'}>
                Optional
              </Typography>
              <TableRow>
                <ColumnHeader leftAlign title="Name" />
                <ColumnHeader leftAlign title="Confirmed?" />
              </TableRow>
            </TableHead>
            <TableBody>
              {designReview.optionalMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Typography>{fullNamePipe(member)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {designReview.confirmedMembers.some((confirmedMember) => confirmedMember.userId === member.userId)
                        ? 'Yes'
                        : 'No'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};
