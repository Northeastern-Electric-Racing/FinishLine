import { DesignReview } from 'shared';
import NERModal from '../../components/NERModal';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ColumnHeader from '../FinancePage/FinanceComponents/ColumnHeader';
import { fullNamePipe } from '../../utils/pipes';

interface DesignReviewAttendeeModalProps {
  open: boolean;
  onHide: () => void;
  designReview: DesignReview;
}

export const DesignReviewAttendeeModal: React.FC<DesignReviewAttendeeModalProps> = ({ open, onHide, designReview }) => {
  return (
    <NERModal open={open} title={designReview.wbsName} onHide={onHide} hideFormButtons>
      <Grid container columnSpacing={8} rowSpacing={2}>
        <Grid item>
          <TableContainer>
            <Table>
              <TableHead>
                <Typography variant="h6">Required Members</Typography>
                <TableRow>
                  <ColumnHeader uncenter title="Name" />
                  <ColumnHeader uncenter title="Confirmed?" />
                </TableRow>
              </TableHead>
              <TableBody>
                {designReview.requiredMembers.map((member) => (
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
        <Grid item>
          <TableContainer>
            <Table>
              <TableHead>
                <Typography variant="h6">Optional Members</Typography>
                <TableRow>
                  <ColumnHeader uncenter title="Name" />
                  <ColumnHeader uncenter title="Confirmed?" />
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
    </NERModal>
  );
};
