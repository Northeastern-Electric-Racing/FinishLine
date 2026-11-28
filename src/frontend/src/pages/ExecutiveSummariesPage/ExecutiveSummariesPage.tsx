import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Redirect } from 'react-router-dom';
import { isGuest } from 'shared';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import CompetitionDocuments from '../../components/CompetitionDocuments';
import CompetitionPerformanceSection from '../../components/CompetitionPerformance';
import ExecSummaryOverview from '../../components/ExecSummaryOverview';
import ExecutiveSummaryOverlays, { OVERLAY_TABS, OverlayTab } from '../../components/ExecutiveSummaryOverlays';
import ExecutiveSummaryBudget from '../../components/ExecutiveSummaryBudget';
import ExecutiveSummaryVehicleDevelopment from '../../components/ExecutiveSummaryVehicleDevelopment';
import RecruitmentMembership from '../../components/RecruitmentMembership';
import { useGetAllCars } from '../../hooks/cars.hooks';
import { useGetAllExecutiveSummaries } from '../../hooks/exec-summaries.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { routes } from '../../utils/routes';
import ErrorPage from '../ErrorPage';

const ExecutiveSummariesPage: React.FC = () => {
  const user = useCurrentUser();
  const [tabValue, setTabValue] = useState<number>(0);
  const [showOverlays, setShowOverlays] = useState(false);
  const [overlayTab, setOverlayTab] = useState<OverlayTab>(OverlayTab.BUDGET);
  const { data: cars, isLoading: carsIsLoading, isError: carsIsError, error: carsError } = useGetAllCars();
  const {
    data: executiveSummaries,
    isLoading: summariesIsLoading,
    isError: summariesIsError,
    error: summariesError
  } = useGetAllExecutiveSummaries();

  if (isGuest(user.role)) return <Redirect to={routes.HOME} />;
  if (carsIsError) return <ErrorPage message={carsError?.message} />;
  if (summariesIsError) return <ErrorPage message={summariesError?.message} />;
  if (carsIsLoading || summariesIsLoading || !cars || !executiveSummaries) return <LoadingIndicator />;

  // newest car first; the api returns dates as strings, so wrap them
  const sortedCars = cars.slice().sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  const selectedCar = sortedCars[tabValue];
  // a car can have several executive summaries over time, so show the most recently created one
  const [executiveSummary] = executiveSummaries
    .filter((summary) => !summary.dateDeleted && summary.car.name === selectedCar?.name)
    .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());

  const modeToggle = (
    <Box display="flex" alignItems="center">
      <Typography>Exec Summaries</Typography>
      <Switch
        checked={showOverlays}
        onChange={(_event, checked) => setShowOverlays(checked)}
        inputProps={{ 'aria-label': 'Show overlays' }}
      />
      <Typography>Overlays</Typography>
    </Box>
  );

  if (showOverlays)
    return (
      <PageLayout
        title="Overlays"
        headerRight={modeToggle}
        tabs={
          <Tabs
            value={overlayTab}
            onChange={(_event, newValue: OverlayTab) => setOverlayTab(newValue)}
            aria-label="executive-summary-overlay-tabs"
          >
            {OVERLAY_TABS.map((tab) => (
              <Tab label={tab.label} value={tab.value} key={tab.value} />
            ))}
          </Tabs>
        }
      >
        <ExecutiveSummaryOverlays tab={overlayTab} />
      </PageLayout>
    );

  return (
    <PageLayout
      title="Executive Summaries"
      headerRight={modeToggle}
      tabs={
        <Tabs
          value={tabValue}
          onChange={(_event, newValue: number) => setTabValue(newValue)}
          aria-label="executive-summary-car-tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          {sortedCars.map((car, idx) => (
            <Tab label={car.name} value={idx} key={car.wbsElementId} />
          ))}
        </Tabs>
      }
    >
      {!executiveSummary ? (
        <Typography textAlign="center" mt={4}>
          No executive summary found for {selectedCar?.name ?? 'this car'}.
        </Typography>
      ) : (
        <Box
          display="grid"
          gap={2}
          pb={2}
          alignItems="stretch"
          gridTemplateColumns={{ xs: 'minmax(0, 1fr)', lg: 'repeat(3, minmax(0, 1fr))' }}
        >
          <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 0, width: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <ExecSummaryOverview executiveSummary={executiveSummary} />
            </CardContent>
          </Card>
          <ExecutiveSummaryVehicleDevelopment executiveSummary={executiveSummary} />
          <Box
            display="flex"
            flexDirection="column"
            gap={2}
            gridRow={{ lg: '1 / span 2' }}
            gridColumn={{ lg: 3 }}
            // the last card absorbs leftover height so this column ends level with the others
            sx={{ '& > :last-child': { flexGrow: 1 } }}
          >
            <CompetitionPerformanceSection competitionPerformances={executiveSummary.competitionPerformances} />
            {executiveSummary.competitionDocumentsSummary && (
              <CompetitionDocuments competitionDocumentsSummary={executiveSummary.competitionDocumentsSummary} />
            )}
          </Box>
          <ExecutiveSummaryBudget executiveSummary={executiveSummary} />
          <RecruitmentMembership recruitmentCycles={executiveSummary.recruitmentCycles} />
        </Box>
      )}
    </PageLayout>
  );
};

export default ExecutiveSummariesPage;
