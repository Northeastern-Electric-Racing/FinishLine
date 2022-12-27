/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { faScroll, faCode, faCommentAlt, faBolt, faCog, faDollarSign, faSearch } from '@fortawesome/free-solid-svg-icons';
import ExternalLink from '../components/ExternalLink';
import PageTitle from '../layouts/PageTitle/PageTitle';
import PageBlock from '../layouts/PageBlock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
            <Typography>
              <ExternalLink
                icon={faScroll}
                description={'Glossary Document'}
                link={'https://docs.google.com/document/d/1_kr7PQxjYKvBTmZc8cxeSv5xx0lE88v0wVXkVg3Mez8/edit?usp=sharing'}
              />
            </Typography>
          </Grid>
          <Grid item>
            <Typography> Got any suggestions for additional resources? Drop a message in Slack! </Typography>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="Support">
        <Box>
          <Typography>
            Any and all questions, comments, suggestions, bugs, or other issues can be directed to the resources below:
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item sm={5} md={4} lg={3}>
            <Typography>
              <ExternalLink
                icon={faCommentAlt}
                link={'slack://channel?team=T7MHAQ5TL&id=C02U5TKHLER'}
                description={'Message in Slack'}
              />
            </Typography>
          </Grid>
          <Grid item sm={6} md={4} lg={3}>
            <Typography>
              <ExternalLink
                icon={faCode}
                description={'Submit a ticket on GitHub'}
                link={'https://github.com/Northeastern-Electric-Racing/FinishLine/issues/new/choose'}
              />
            </Typography>
          </Grid>
        </Grid>
      </PageBlock>
      <PageBlock title="Calendars">
        <Grid container rowSpacing={2} columnSpacing={1}>
          <Grid item md={4} lg={3}>
            <Box>
              <FontAwesomeIcon icon={faScroll} className="mx-2" style={{ margin: '0px 5px' }} />{' '}
              <Typography display="inline">Club-Wide Meetings & Events</Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=l2vtfdaeu2lisoip58tijijtvc%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/l2vtfdaeu2lisoip58tijijtvc%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Typography>
            </Box>
          </Grid>
          <Grid item md={4} lg={3}>
            <Box>
              <FontAwesomeIcon icon={faBolt} className="mx-2" style={{ margin: '0px 5px' }} />{' '}
              <Typography display="inline">Electrical Meetings</Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=npitbmnpkcnpcftfu259tthq6g%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/npitbmnpkcnpcftfu259tthq6g%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Typography>
            </Box>
          </Grid>
          <Grid md={4} lg={6}>
            <Box>
              <FontAwesomeIcon icon={faCog} className="mx-2" style={{ margin: '0px 5px' }} />{' '}
              <Typography display="inline">Mechanical Meetings</Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=qrtikitnuchp43873l1h17mhe8%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/qrtikitnuchp43873l1h17mhe8%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Typography>
            </Box>
          </Grid>
          <Grid md={4} lg={3}>
            <Box>
              <FontAwesomeIcon icon={faDollarSign} className="mx-2" style={{ margin: '0px 5px' }} />{' '}
              <Typography display="inline">Business Meetings</Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=j3hkd9o6onheu4fvhojno6qdf4%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/j3hkd9o6onheu4fvhojno6qdf4%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Typography>
            </Box>
          </Grid>
          <Grid item md={4} lg={3}>
            <Box>
              <FontAwesomeIcon icon={faCode} className="mx-2" style={{ margin: '0px 5px' }} />{' '}
              <Typography display="inline">Software Meetings</Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=55gqs0qvt4mjcmsqn8ln8a5njg%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/55gqs0qvt4mjcmsqn8ln8a5njg%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Typography>
            </Box>
          </Grid>
          <Grid md={4} lg={6}>
            <Box>
              <FontAwesomeIcon icon={faSearch} className="mx-2" style={{ margin: '0px 5px' }} />{' '}
              <Typography display="inline">Engineering Reviews</Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="Public URL"
                  link="https://calendar.google.com/calendar/embed?src=qqojrdj50ob1m79vt2h3blmn1s%40group.calendar.google.com&ctz=America%2FNew_York"
                ></ExternalLink>
              </Typography>
            </Box>
            <Box>
              <Typography>
                <ExternalLink
                  description="iCal URL"
                  link="https://calendar.google.com/calendar/ical/qqojrdj50ob1m79vt2h3blmn1s%40group.calendar.google.com/public/basic.ics"
                ></ExternalLink>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </PageBlock>
    </>
  );
};

export default InfoPage;
