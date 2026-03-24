import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { alpha, Box, useMediaQuery, useTheme } from '@mui/system';
import PageLayout from '../../components/PageLayout';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import { Chip, Typography } from '@mui/material';
import { useState } from 'react';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import { ChangeRequest, wbsPipe } from 'shared';
import { ChangeRequestTypeTextPipe, ChangeRequestStatusTextPipe } from '../../utils/enum-pipes';

const CrCard = ({ cr }: { cr: ChangeRequest }) => {
  const theme = useTheme();

  const submitterName =
    cr.submitter?.firstName && cr.submitter?.lastName ? `${cr.submitter.firstName} ${cr.submitter.lastName}` : 'N/A';
  const reviewerName =
    cr.reviewer?.firstName && cr.reviewer?.lastName ? `${cr.reviewer.firstName} ${cr.reviewer.lastName}` : 'N/A';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        p: 2,
        mb: 1,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        borderRadius: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography fontWeight="bold" fontSize={18}>
          CR #{cr.identifier.toLocaleString()}
        </Typography>
        <Chip
          size="small"
          variant="filled"
          sx={{
            fontSize: 12,
            bgcolor: alpha(theme.palette.primary.main, 0.45),
            color: theme.palette.primary.light
          }}
          label={ChangeRequestStatusTextPipe(cr.status)}
        />
      </Box>
      <Typography fontSize={12} color="text.secondary">
        Submitter: {submitterName} {' · '} Reviewer: {reviewerName}
      </Typography>
      <Typography fontSize={12} color="text.secondary">
        {cr.wbsNum ? `${wbsPipe(cr.wbsNum)} - ` : ''}
        {cr.wbsName ? `${cr.wbsName} · ` : ''}
        {ChangeRequestTypeTextPipe(cr.type)}
      </Typography>
    </Box>
  );
};

const GuestChangeRequestsPage: React.FC = () => {
  const { data: allCrs, isLoading, isError, error } = useAllChangeRequests();
  const [selectedTeamTypes, setSelectedTeamTypes] = useState<string[]>([]);
  const isMobilePortrait = useMediaQuery('(max-width:480px)');
  const {
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    data: teamTypes,
    error: teamTypesError
  } = useAllTeamTypes();

  if (isLoading || !allCrs || teamTypesIsLoading || !teamTypes) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError.message} />;

  const filteredCrs = allCrs.filter(
    (cr) => selectedTeamTypes.length === 0 || cr.teamTypeNames.some((name) => selectedTeamTypes.includes(name))
  );

  return (
    <PageLayout title="Change Requests">
      <Box
        width={'100%'}
        display={'flex'}
        justifyContent={'center'}
        gap={2}
        mb={3}
        sx={{
          overflowX: 'auto',
          pb: 1
        }}
      >
        {teamTypes.map((team) => (
          <Chip
            key={team.name}
            label={team.name}
            onClick={() =>
              setSelectedTeamTypes((prev) =>
                prev?.includes(team.name) ? prev.filter((t: string) => t !== team.name) : [...(prev || []), team.name]
              )
            }
            clickable
            color={selectedTeamTypes?.includes(team.name) ? 'primary' : 'default'}
            sx={{ flexShrink: 0 }}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobilePortrait ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobilePortrait ? 2 : 3,
          width: '100%',
          px: isMobilePortrait ? 1 : 0
        }}
      >
        {filteredCrs.map((changeRequest) => (
          <CrCard cr={changeRequest} />
        ))}
      </Box>
    </PageLayout>
  );
};

export default GuestChangeRequestsPage;
