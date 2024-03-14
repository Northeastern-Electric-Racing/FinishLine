/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CodeIcon from '@mui/icons-material/Code';
import ChatIcon from '@mui/icons-material/Chat';
import ExternalLink from '../components/ExternalLink';
import PageBlock from '../layouts/PageBlock';
import PageLayout from '../components/PageLayout';
import { Button } from '@mui/material';
import { useState } from 'react';
import DRCSummaryModal from './DesignReviewSummaryModal';
import { DesignReview, DesignReviewStatus } from 'shared';
import {
  batman,
  superman,
  greenlantern,
  flash,
  aquaman,
  wonderwoman
} from '../../../backend/tests/test-data/users.test-data';

const InfoPage: React.FC = () => {
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const exampleDesignReview: DesignReview = {
    designReviewId: '123',
    dateScheduled: new Date(),
    meetingTimes: [1, 4, 8, 34],
    dateCreated: new Date(),
    userCreated: batman,
    status: DesignReviewStatus.DONE,
    teamType: { teamTypeId: 'typeIDString', name: 'thisteam' },
    requiredMembers: [batman, superman, greenlantern, flash, aquaman],
    optionalMembers: [wonderwoman],
    confirmedMembers: [],
    deniedMembers: [],
    location: 'Room 101',
    isOnline: true,
    isInPerson: false,
    zoomLink: 'https://example.com/zoomlink',
    attendees: [],
    wbsName: 'Battery',
    wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 1 },
    docTemplateLink: 'https://www.google.com'
  };

  return (
    <PageLayout title="Information">
      <PageBlock title="Resources">
        <Box>
          <Typography>Check out these helpful resources:</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item md={4} lg={3}>
            <ExternalLink
              icon={<InsertDriveFileIcon />}
              description={'Glossary Document'}
              link={'https://docs.google.com/document/d/1_kr7PQxjYKvBTmZc8cxeSv5xx0lE88v0wVXkVg3Mez8/edit?usp=sharing'}
            />
          </Grid>
          <Grid item>
            <Typography>Got any suggestions for additional resources? Drop a message in Slack!</Typography>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="Support">
        <Typography>
          Any and all questions, comments, suggestions, bugs, or other issues can be directed to the resources below:
        </Typography>
        <Grid container spacing={2}>
          <Grid item sm={5} md={4} lg={3}>
            <ExternalLink
              icon={<ChatIcon />}
              link={'slack://channel?team=T7MHAQ5TL&id=C02U5TKHLER'}
              description={'Message in Slack'}
            />
          </Grid>
          <Grid item sm={6} md={4} lg={3}>
            <ExternalLink
              icon={<CodeIcon />}
              description={'Submit a ticket on GitHub'}
              link={'https://github.com/Northeastern-Electric-Racing/FinishLine/issues/new/choose'}
            />
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="DRC Summary">
        <Button onClick={() => setIsSummaryModalOpen(true)}>Open DRC Summary</Button>
      </PageBlock>
      <DRCSummaryModal
        open={isSummaryModalOpen}
        onHide={() => setIsSummaryModalOpen(false)}
        designReview={exampleDesignReview}
      />
    </PageLayout>
  );
};

export default InfoPage;
