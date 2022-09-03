/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { WorkPackage } from 'shared';
import { weeksPipe, wbsPipe, endDatePipe, listPipe, datePipe } from '../../../utils/Pipes';
import { routes } from '../../../utils/Routes';
import WbsStatus from '../../../components/WbsStatus';
import Grid from '@mui/material/Grid';

interface WorkPackageSummaryProps {
  workPackage: WorkPackage;
}

const WorkPackageSummary: React.FC<WorkPackageSummaryProps> = ({ workPackage }) => {
  const expectedActivitiesList = (
    <ul>
      {workPackage.expectedActivities.slice(0, 3).map((item, idx) => (
        <li key={idx}>{item.detail}</li>
      ))}
    </ul>
  );
  const numMoreExpectedActivities = workPackage.expectedActivities.length - 3;
  const deliverablesList = (
    <ul>
      {workPackage.deliverables.slice(0, 3).map((item, idx) => (
        <li key={idx}>{item.detail}</li>
      ))}
    </ul>
  );
  const numMoreDeliverables = workPackage.deliverables.length - 3;

  return (
    <Accordion>
      <AccordionSummary
        id={`${wbsPipe(workPackage.wbsNum)}-summary-header`}
        aria-controls={`${wbsPipe(workPackage.wbsNum)}-summary-content`}
      >
        <Typography>{wbsPipe(workPackage.wbsNum)}</Typography>
        <Box flexGrow={1} paddingLeft={2}>
          <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}>
            {workPackage.name}
          </Link>
        </Box>
        <WbsStatus status={workPackage.status} />
        <Typography paddingLeft={2}>{weeksPipe(workPackage.duration)}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box flexGrow={1}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" flexDirection="row" flexGrow={0.5}>
                <Box display="flex" flexDirection="row" paddingRight={2}>
                  <Typography fontWeight="bold" paddingRight={1}>
                    Start date:
                  </Typography>
                  <Typography>{datePipe(workPackage.startDate)}</Typography>
                </Box>
                <Box display="flex" flexDirection="row">
                  <Typography fontWeight="bold" paddingRight={1}>
                    End date:
                  </Typography>
                  <Typography>
                    {endDatePipe(workPackage.startDate, workPackage.duration)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box display="flex" flexDirection="row">
                <Typography fontWeight="bold">Dependencies:</Typography>
                <Typography>{listPipe(workPackage.dependencies, wbsPipe)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight="bold">Expected Activities:</Typography>
              <Typography>{expectedActivitiesList}</Typography>
              {numMoreExpectedActivities > 0 ? (
                <Link
                  component={RouterLink}
                  to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}
                >
                  Show {numMoreExpectedActivities} more...
                </Link>
              ) : (
                <></>
              )}
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight="bold">Deliverables:</Typography>
              <Typography>{deliverablesList}</Typography>
              {numMoreDeliverables > 0 ? (
                <Link
                  component={RouterLink}
                  to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}
                >
                  Show {numMoreDeliverables} more...
                </Link>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default WorkPackageSummary;
