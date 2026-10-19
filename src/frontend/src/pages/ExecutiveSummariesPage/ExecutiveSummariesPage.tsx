import { useState } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { Redirect } from 'react-router-dom';
import { isGuest } from 'shared';
import PageLayout from '../../components/PageLayout';
import LoadingIndicator from '../../components/LoadingIndicator';
import CompetitionDocuments from '../../components/CompetitionDocuments';
import CompetitionPerformanceSection from '../../components/CompetitionPerformance';
import ExecutiveSummaryBudget from '../../components/ExecutiveSummaryBudget';
import RecruitmentMembership from '../../components/RecruitmentMembership';
import { useGetAllCars } from '../../hooks/cars.hooks';
import { useGetAllExecutiveSummaries } from '../../hooks/exec-summaries.hooks';
import { useCurrentUser } from '../../hooks/users.hooks';
import { routes } from '../../utils/routes';
import ErrorPage from '../ErrorPage';

const ExecutiveSummariesPage: React.FC = () => {
  const user = useCurrentUser();
  const [tabValue, setTabValue] = useState<number>(0);
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

  return (
    <PageLayout
      title="Executive Summaries"
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
        <Box display="flex" flexWrap="wrap" justifyContent="center" alignItems="flex-start" gap={3} pb={4}>
          <CompetitionPerformanceSection competitionPerformances={executiveSummary.competitionPerformances} />
          <ExecutiveSummaryBudget executiveSummary={executiveSummary} />
          <RecruitmentMembership recruitmentCycles={executiveSummary.recruitmentCycles} />
          {executiveSummary.competitionDocumentsSummary && (
            <CompetitionDocuments competitionDocumentsSummary={executiveSummary.competitionDocumentsSummary} />
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default ExecutiveSummariesPage;
