/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import { Container, Form, InputGroup } from 'react-bootstrap';
import { Link as RouterLink } from 'react-router-dom';
import { WbsElementStatus } from 'shared';
import { useAllWorkPackages } from '../../hooks/WorkPackages.hooks';
import { datePipe, wbsPipe, fullNamePipe, percentPipe } from '../../utils/Pipes';
import { routes } from '../../utils/Routes';
import LoadingIndicator from '../../components/LoadingIndicator';
import PageBlock from '../../layouts/PageBlock';
import ErrorPage from '../ErrorPage';

const UpcomingDeadlines: React.FC = () => {
  const [daysUntilDeadline, setDaysUntilDeadline] = useState<string>('14');
  const workPackages = useAllWorkPackages({ status: WbsElementStatus.Active, daysUntilDeadline });

  if (workPackages.isError) {
    return <ErrorPage message={workPackages.error.message} error={workPackages.error} />;
  }

  const fullDisplay = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'auto',
        justifyContent: 'flex-start'
      }}
    >
      {workPackages.data?.length === 0
        ? 'No upcoming deadlines'
        : workPackages.data?.map((wp) => (
            <Card key={wbsPipe(wp.wbsNum)} sx={{ minWidth: 'fit-content' }}>
              <CardContent sx={{ padding: 3 }}>
                <Link
                  variant="h6"
                  component={RouterLink}
                  to={`${routes.PROJECTS}/${wbsPipe(wp.wbsNum)}`}
                  sx={{ marginBottom: 2 }}
                >
                  {wbsPipe(wp.wbsNum)} - {wp.name}
                </Link>

                <Box>
                  <Box>End Date: {datePipe(wp.endDate)}</Box>
                  <Box>
                    Progress: {percentPipe(wp.progress)}, {wp.timelineStatus}
                  </Box>
                  <Box>Engineering Lead: {fullNamePipe(wp.projectLead)}</Box>
                  <Box>Project Manager: {fullNamePipe(wp.projectManager)}</Box>
                  <Box>
                    {wp.expectedActivities.length} Expected Activities, {wp.deliverables.length}{' '}
                    Deliverables
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
    </Box>
  );

  return (
    <PageBlock
      title={`Upcoming Deadlines (${workPackages.data?.length})`}
      headerRight={
        <InputGroup>
          <InputGroup.Prepend>
            <InputGroup.Text>Next</InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            custom
            as="select"
            value={daysUntilDeadline}
            onChange={(e) => setDaysUntilDeadline(e.target.value)}
          >
            {['1', '2', '5', '7', '14', '21', '30'].map((days) => (
              <option key={days} value={days}>
                {days}
              </option>
            ))}
          </Form.Control>
          <InputGroup.Append>
            <InputGroup.Text>Days</InputGroup.Text>
          </InputGroup.Append>
        </InputGroup>
      }
    >
      <Container fluid>{workPackages.isLoading ? <LoadingIndicator /> : fullDisplay}</Container>
    </PageBlock>
  );
};

export default UpcomingDeadlines;
