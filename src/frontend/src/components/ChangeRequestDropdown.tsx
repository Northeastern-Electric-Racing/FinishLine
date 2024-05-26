import { Box, FormControl, FormLabel } from '@mui/material';
import { isWithinInterval, subDays } from 'date-fns';
import { Control, Controller } from 'react-hook-form';
import { AuthenticatedUser, ChangeRequest, wbsPipe } from 'shared';
import { useAllChangeRequests } from '../hooks/change-requests.hooks';
import { useCurrentUser } from '../hooks/users.hooks';
import LoadingIndicator from './LoadingIndicator';
import NERAutocomplete from './NERAutocomplete';

// Filter and sort change requests to display in the dropdown
const getFilteredChangeRequests = (changeRequests: ChangeRequest[], user: AuthenticatedUser): ChangeRequest[] => {
  const today = new Date();
  const fiveDaysAgo = subDays(today, 5);

  const filteredRequests = changeRequests.filter(
    (cr) =>
      cr.accepted && (cr.dateImplemented ? isWithinInterval(cr.dateImplemented, { start: fiveDaysAgo, end: today }) : true)
  );

  // The current user's CRs should be at the top
  filteredRequests.sort((a: ChangeRequest, b: ChangeRequest) => {
    const isSubmitterAUser = a.submitter.userId === user.userId;
    const isSubmitterBUser = b.submitter.userId === user.userId;

    if (isSubmitterAUser && isSubmitterBUser) return 0;
    if (isSubmitterAUser) return -1;
    if (isSubmitterBUser) return 1;

    return a.identifier - b.identifier;
  });

  return filteredRequests;
};

interface ChangeRequestDropdownProps {
  control: Control<any, any>;
  name: string;
}

const ChangeRequestDropdown = ({ control, name }: ChangeRequestDropdownProps) => {
  const user = useCurrentUser();
  const { isLoading, data: changeRequests } = useAllChangeRequests();
  if (isLoading || !changeRequests) return <LoadingIndicator />;

  const filteredRequests = getFilteredChangeRequests(changeRequests, user);

  const approvedChangeRequestOptions = filteredRequests.map((cr) => ({
    label: `${cr.identifier} - ${wbsPipe(cr.wbsNum)} - ${cr.submitter.firstName} ${cr.submitter.lastName} - ${cr.type}`,
    id: cr.crId
  }));

  return (
    <Box>
      <FormControl fullWidth>
        <FormLabel sx={{ alignSelf: 'start' }}>Change Request ID</FormLabel>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <NERAutocomplete
              sx={{ width: '100%' }}
              id="change-request-id-autocomplete"
              onChange={(_event, newValue) => onChange(newValue ? newValue.id : '')}
              options={approvedChangeRequestOptions}
              size="small"
              placeholder="Change Request ID"
              value={approvedChangeRequestOptions.find((cr) => cr.id === value) || { id: '', label: '' }}
            />
          )}
        />
      </FormControl>
    </Box>
  );
};

export default ChangeRequestDropdown;
