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
import DRCViewModal from './DesignReviewViewModal';
import DRCEditModal from './DesignReviewEditModal';
import { useState } from 'react';
import {
  batman,
  superman,
  theVisitor,
  greenlantern,
  wonderwoman,
  flash,
  aquaman
} from '../../../backend/tests/test-data/users.test-data';
import DRCView from './DesignReviewView';

const InfoPage: React.FC = () => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenViewModal = () => setIsViewModalOpen(true);
  const handleCloseViewModal = () => setIsViewModalOpen(false);

  const handleOpenEditModal = () => setIsEditModalOpen(true);
  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const usersToAvailabilities = new Map([
    [superman, [1, 2, 3, 4, 5, 6, 7]],
    [batman, [2, 3, 4, 5, 6, 7]],
    [theVisitor, [3, 4, 5, 6, 7]],
    [greenlantern, [4, 5, 6, 7]],
    [wonderwoman, [5, 6, 7]],
    [flash, [6, 7]],
    [aquaman, [7]]
  ]);
  return (
    <PageLayout title="Information">
      {/* <PageBlock title="Resources">
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
      </PageBlock> */}
      <PageBlock title="DRC VIEW">
        <button onClick={handleOpenViewModal}>OPEN VIEW MODAL</button>
      </PageBlock>
      <PageBlock title="DRC EDIT">
        <button onClick={handleOpenEditModal}>OPEN EDIT MODAL</button>
      </PageBlock>
      <DRCViewModal
        open={isViewModalOpen}
        onHide={handleCloseViewModal}
        title={'Battery'}
        usersToAvailabilities={usersToAvailabilities}
      />
      <DRCEditModal
        open={isEditModalOpen}
        onHide={handleCloseEditModal}
        title={'Battery'}
        usersToAvailabilities={usersToAvailabilities}
      />
      <DRCView title={'Battery'} usersToAvailabilities={usersToAvailabilities} />
    </PageLayout>
  );
};

export default InfoPage;
