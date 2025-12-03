import { Event } from 'shared';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ColumnHeader from '../FinancePage/FinanceComponents/ColumnHeader';
import { fullNamePipe } from '../../utils/pipes';

interface EventAvailabilityInfoProps {
  event: Event;
}

export const EventAvailabilityInfo: React.FC<EventAvailabilityInfoProps> = ({ event }) => {
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
              {event.requiredMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell align="left">
                    <Typography>{fullNamePipe(member)}</Typography>
                  </TableCell>
                  <TableCell align="left">
                    <Typography>
                      {event.confirmedMembers.some((confirmedMember) => confirmedMember.userId === member.userId)
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
              {event.optionalMembers.map((member) => (
                <TableRow key={member.userId}>
                  <TableCell>
                    <Typography>{fullNamePipe(member)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {event.confirmedMembers.some((confirmedMember) => confirmedMember.userId === member.userId)
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
