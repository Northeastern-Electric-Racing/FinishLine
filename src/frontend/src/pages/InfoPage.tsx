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
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import ExternalLink from '../components/ExternalLink';
import PageTitle from '../layouts/PageTitle/PageTitle';
import PageBlock from '../layouts/PageBlock';

const InfoPage: React.FC = () => {
  return (
    <>
      <PageTitle title="Information" previousPages={[]} />
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
      <PageBlock title="Calendars">
        <Grid container>
          <Grid item md={4} lg={3}>
            <Typography display="inline-flex" alignItems="center" style={{ marginTop: '5px' }}>
              <EventIcon className="mx-2" style={{ margin: '0px 5px' }} fontSize="small" />
              Club-Wide Meetings & Events
            </Typography>
            <ExternalLink
              description="Public URL"
              link="https://calendar.google.com/calendar/embed?src=l2vtfdaeu2lisoip58tijijtvc%40group.calendar.google.com&ctz=America%2FNew_York"
            />
            <ExternalLink
              description="iCal URL"
              link="https://calendar.google.com/calendar/ical/l2vtfdaeu2lisoip58tijijtvc%40group.calendar.google.com/public/basic.ics"
            />
          </Grid>
          <Grid item md={4} lg={3}>
            <Typography display="inline-flex" alignItems="center" style={{ marginTop: '5px' }}>
              <ElectricBoltIcon className="mx-2" style={{ margin: '0px 5px' }} fontSize="small" />
              Electrical Meetings
            </Typography>
            <ExternalLink
              description="Public URL"
              link="https://calendar.google.com/calendar/embed?src=npitbmnpkcnpcftfu259tthq6g%40group.calendar.google.com&ctz=America%2FNew_York"
            />
            <ExternalLink
              description="iCal URL"
              link="https://calendar.google.com/calendar/ical/npitbmnpkcnpcftfu259tthq6g%40group.calendar.google.com/public/basic.ics"
            />
          </Grid>
          <Grid item md={4} lg={6}>
            <Typography display="inline-flex" alignItems="center" style={{ marginTop: '5px' }}>
              <SettingsIcon className="mx-2" style={{ margin: '0px 5px' }} fontSize="small" />
              Mechanical Meetings
            </Typography>
            <ExternalLink
              description="Public URL"
              link="https://calendar.google.com/calendar/embed?src=qrtikitnuchp43873l1h17mhe8%40group.calendar.google.com&ctz=America%2FNew_York"
            />
            <ExternalLink
              description="iCal URL"
              link="https://calendar.google.com/calendar/ical/qrtikitnuchp43873l1h17mhe8%40group.calendar.google.com/public/basic.ics"
            />
          </Grid>
          <Grid item md={4} lg={3}>
            <Typography display="inline-flex" alignItems="center" style={{ marginTop: '5px' }}>
              <AttachMoneyIcon className="mx-2" style={{ margin: '0px 5px' }} fontSize="small" />
              Business Meetings
            </Typography>
            <ExternalLink
              description="Public URL"
              link="https://calendar.google.com/calendar/embed?src=j3hkd9o6onheu4fvhojno6qdf4%40group.calendar.google.com&ctz=America%2FNew_York"
            />
            <ExternalLink
              description="iCal URL"
              link="https://calendar.google.com/calendar/ical/j3hkd9o6onheu4fvhojno6qdf4%40group.calendar.google.com/public/basic.ics"
            />
          </Grid>
          <Grid item md={4} lg={3}>
            <Typography display="inline-flex" alignItems="center" style={{ marginTop: '5px' }}>
              <CodeIcon className="mx-2" style={{ margin: '0px 5px' }} fontSize="small" />
              Software Meetings
            </Typography>
            <ExternalLink
              description="Public URL"
              link="https://calendar.google.com/calendar/embed?src=55gqs0qvt4mjcmsqn8ln8a5njg%40group.calendar.google.com&ctz=America%2FNew_York"
            />
            <ExternalLink
              description="iCal URL"
              link="https://calendar.google.com/calendar/ical/55gqs0qvt4mjcmsqn8ln8a5njg%40group.calendar.google.com/public/basic.ics"
            />
          </Grid>
          <Grid item md={4} lg={6}>
            <Typography display="inline-flex" alignItems="center" style={{ marginTop: '5px' }}>
              <SearchIcon className="mx-2" style={{ margin: '0px 5px' }} fontSize="small" />
              Engineering Reviews
            </Typography>
            <ExternalLink
              description="Public URL"
              link="https://calendar.google.com/calendar/embed?src=qqojrdj50ob1m79vt2h3blmn1s%40group.calendar.google.com&ctz=America%2FNew_York"
            />
            <ExternalLink
              description="iCal URL"
              link="https://calendar.google.com/calendar/ical/qqojrdj50ob1m79vt2h3blmn1s%40group.calendar.google.com/public/basic.ics"
            />
          </Grid>
        </Grid>
      </PageBlock>
    </>
  );
};

export default InfoPage;
