/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Add } from '@mui/icons-material';
import { routes } from '../../utils/routes';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import { Box, Grid, Tab, Tabs, useTheme } from '@mui/material';
import { useAuth } from '../../hooks/auth.hooks';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { isGuest, isLeadership, isHead, ChangeRequest, Project, WorkPackage } from 'shared';
import PageBlock from '../../layouts/PageBlock';
import { useAllProjects } from '../../hooks/projects.hooks';
import { useAllWorkPackages } from '../../hooks/work-packages.hooks';
import ChangeRequestDetailCard from '../../components/ChangeRequestDetailCard';

const ChangeRequestsOverview: React.FC = () => {
  const history = useHistory();
  const theme = useTheme();
  const auth = useAuth();
  const { user } = auth;

  const { isLoading, isError, error, data } = useAllChangeRequests();

  // Values that go in the URL depending on the tab value
  const viewUrlValues = useMemo(() => ['overview', 'all-change-requests'], []);

  const match = useRouteMatch<{ tabValueString: string }>(`${routes.CHANGE_REQUESTS}/:tabValueString`);
  const tabValueString = match?.params?.tabValueString;

  // Default to the "overview" tab
  const initialValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
  const [tabIndex, setTabIndex] = useState<number>(initialValue);

  // Change tab when the browser forward/back button is pressed
  const { pathname } = useLocation();
  useEffect(() => {
    const newTabValue: number = viewUrlValues.indexOf(tabValueString ?? 'overview');
    setTabIndex(newTabValue);
  }, [pathname, setTabIndex, viewUrlValues, tabValueString]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  const showToReview = isHead(auth.user?.role) || isLeadership(auth.user?.role);

  const { data: projects, isError: projectIsError, isLoading: projectLoading, error: projectError } = useAllProjects();
  const { data: workPackages, isError: wpIsError, isLoading: wpLoading, error: wpError } = useAllWorkPackages();

  if (isLoading || projectLoading || wpLoading || !data || !projects || !workPackages || !user) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;
  if (projectIsError) return <ErrorPage message={projectError?.message} />;
  if (wpIsError) return <ErrorPage message={wpError?.message} />;

  const myProjects = projects.filter((project: Project) =>
    project.team
      ? project.team.teamId === user.teamAsLeadId
      : false || project.projectLead
      ? project.projectLead.userId === user.userId
      : false || project.projectManager
      ? project.projectManager.userId === user.userId
      : false
  );

  const myWorkPackages = workPackages.filter((wp: WorkPackage) =>
    wp.projectLead
      ? wp.projectLead.userId === user.userId
      : false || wp.projectManager
      ? wp.projectManager.userId === user.userId
      : false
  );

  const currentDate = new Date();

  const crToReview = data.filter(
    (cr: ChangeRequest) =>
      !cr.dateReviewed &&
      (myProjects.map((project: Project) => project.wbsNum).includes(cr.wbsNum) ||
        myWorkPackages.map((wp: WorkPackage) => wp.wbsNum).includes(cr.wbsNum))
  );
  crToReview.sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());
  const crUnapproved = data.filter((cr: ChangeRequest) => !cr.dateReviewed && cr.submitter.userId === user.userId);
  crUnapproved.sort((a, b) => b.dateSubmitted.getTime() - a.dateSubmitted.getTime());
  const crApproved = data.filter(
    (cr: ChangeRequest) =>
      cr.dateImplemented &&
      cr.submitter.userId === user.userId &&
      currentDate.getTime() - cr.dateImplemented.getTime() <= 1000 * 60 * 60 * 24 * 5
  );
  crApproved.sort((a, b) =>
    a.dateImplemented && b.dateImplemented ? b.dateImplemented?.getTime() - a.dateImplemented?.getTime() : 0
  );

  const displayWrap = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'auto',
        justifyContent: 'flex-start',
        '&::-webkit-scrollbar': {
          height: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  const displayScroll = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        overflow: 'auto',
        justifyContent: 'flex-start',
        '&::-webkit-scrollbar': {
          height: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.divider,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        }
      }}
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  return (
    <>
      <div>
        <div style={{ marginBottom: 15 }}>
          <PageTitle
            title={'Change Requests'}
            previousPages={[]}
            tabs={
              <Tabs value={tabIndex} onChange={handleTabChange} variant="standard" aria-label="change-request-tabs">
                <Tab
                  label="Overview"
                  aria-label="overview"
                  value={0}
                  component={RouterLink}
                  to={`${routes.CHANGE_REQUESTS}/overview`}
                />
                <Tab
                  label="All Change Requests"
                  aria-label="all-change-requests"
                  value={1}
                  component={RouterLink}
                  to={`${routes.ALL_CHANGE_REQUESTS}`}
                />
              </Tabs>
            }
            actionButton={
              <NERButton
                variant="contained"
                disabled={isGuest(auth.user?.role)}
                startIcon={<Add />}
                onClick={() => history.push(routes.CHANGE_REQUESTS_NEW)}
              >
                New Change Request
              </NERButton>
            }
          />
        </div>
        <div>
          {showToReview ? (
            <PageBlock title={'To Review'} headerRight={`${crToReview.length} Left`}>
              <Grid container>{displayScroll(crToReview)}</Grid>
            </PageBlock>
          ) : null}
          <PageBlock title={'My Un-reviewed Change Requests'} headerRight={`${crUnapproved.length} Left`}>
            <Grid container>{displayScroll(crUnapproved)}</Grid>
          </PageBlock>
          <PageBlock title={'My Approved Change Requests'} headerRight={`${crApproved.length} Left`} defaultClosed>
            <Grid container>{displayWrap(crApproved)}</Grid>
          </PageBlock>
        </div>
      </div>
    </>
  );
};

export default ChangeRequestsOverview;
