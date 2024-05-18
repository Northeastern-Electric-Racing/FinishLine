/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { calculateEndDate, WorkPackage } from 'shared';
import { weeksPipe, wbsPipe, datePipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import WbsStatus from '../../../components/WbsStatus';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import WorkPackageStageChip from '../../../components/WorkPackageStageChip';
import { useGetManyWorkPackages } from '../../../hooks/work-packages.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';

interface WorkPackageSummaryProps {
  workPackage: WorkPackage;
}

const WorkPackageSummary: React.FC<WorkPackageSummaryProps> = ({ workPackage }) => {
  const { data: dependencies, isError, isLoading, error } = useGetManyWorkPackages(workPackage.blockedBy);
  const theme = useTheme();

  if (!dependencies || isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const numMoreDescriptionBullets = workPackage.descriptionBullets.length - 3;
  const descriptionBulletList = (
    <ul>
      {workPackage.descriptionBullets.slice(0, 3).map((item, idx) => (
        <li key={idx}>
          <Typography>{item.detail}</Typography>
        </li>
      ))}
    </ul>
  );

  const DependencyList = () => (
    <Box sx={{ fontWeight: 'normal', display: 'inline' }}>
      {dependencies.map((wp: WorkPackage, idx) => (
        <Typography display="inline" key={idx}>
          <Link component={RouterLink} fontWeight="bold" to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`}>
            {`${wbsPipe(wp.wbsNum)} - ${wp.name}`}
          </Link>
          {dependencies.indexOf(wp) !== workPackage.blockedBy.length - 1 ? ', ' : ''}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Accordion sx={{ border: '1px solid ' + theme.palette.divider, background: theme.palette.background.default }}>
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
        {workPackage.stage ? <WorkPackageStageChip stage={workPackage.stage} /> : null}
        <WbsStatus status={workPackage.status} />
        <Typography paddingLeft={2}>{weeksPipe(workPackage.duration)}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Box flexGrow={1}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box display="flex" flexDirection="row" flexGrow={0.5}>
                <Box display="flex" flexDirection="row" paddingRight={2}>
                  <DetailDisplay label="Start Date" content={datePipe(workPackage.startDate)} paddingRight={1} />
                </Box>
                <Box display="flex" flexDirection="row">
                  <DetailDisplay
                    label="End Date"
                    content={datePipe(calculateEndDate(workPackage.startDate, workPackage.duration))}
                    paddingRight={1}
                  />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight="bold" paddingRight={1} display="inline">
                {'Blocked By: '}
              </Typography>
              <DependencyList></DependencyList>
            </Grid>
            <Grid item xs={6}>
              <Typography fontWeight="bold">Expected Activities:</Typography>
              {descriptionBulletList}
              {numMoreDescriptionBullets > 0 && (
                <Link component={RouterLink} to={`${routes.PROJECTS}/${wbsPipe(workPackage.wbsNum)}`}>
                  Show {numMoreDescriptionBullets} more...
                </Link>
              )}
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default WorkPackageSummary;
