import { Box, FormControl, FormHelperText, FormLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { isWithinInterval, subDays } from 'date-fns';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { AuthenticatedUser, ChangeRequest, wbsPipe } from 'shared';
import { useAllChangeRequests } from '../hooks/change-requests.hooks';
import { useCurrentUser } from '../hooks/users.hooks';
import LoadingIndicator from './LoadingIndicator';

// Filter and sort change requests to display in the dropdown
const getFilteredChangeRequests = (changeRequests: ChangeRequest[], user: AuthenticatedUser): ChangeRequest[] => {
  const today = new Date();
  const fiveDaysAgo = subDays(today, 5);

  const filteredRequests = changeRequests.filter(
    (cr) => cr.dateImplemented && cr.accepted && isWithinInterval(cr.dateImplemented, { start: fiveDaysAgo, end: today })
  );

  // The current user's CRs should be at the top
  filteredRequests.sort((a, b) => {
    const isSubmitterAUser = a.submitter.userId === user.userId;
    const isSubmitterBUser = b.submitter.userId === user.userId;

    if (isSubmitterAUser && isSubmitterBUser) return 0;
    if (isSubmitterAUser) return -1;
    if (isSubmitterBUser) return 1;

    return a.crId - b.crId;
  });

  return filteredRequests;
};

interface ChangeRequestDropdownProps {
  control: Control<any, any>;
  name: string;
  errors: FieldErrors<ChangeRequest>;
  changeHeight?: number;
}

const ChangeRequestDropdown = ({ control, name, errors, changeHeight = 1 }: ChangeRequestDropdownProps) => {
  const user = useCurrentUser();
  const { isLoading, data: changeRequests } = useAllChangeRequests();
  if (isLoading || !changeRequests) return <LoadingIndicator />;

  const filteredRequests = getFilteredChangeRequests(changeRequests, user);

  const approvedChangeRequestOptions = filteredRequests.map((cr) => ({
    label: `${cr.crId} - ${wbsPipe(cr.wbsNum)} - ${cr.submitter.firstName} ${cr.submitter.lastName} - ${cr.type}`,
    value: cr.crId
  }));

  const renderValues = new Map<number, string>();

  changeRequests.forEach((cr) => renderValues.set(cr.crId, `${cr.crId} - ${wbsPipe(cr.wbsNum)}`));

  return (
    <Box>
      <FormControl fullWidth>
        <FormLabel sx={{ alignSelf: 'start' }}>Change Request ID</FormLabel>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <Select
              id="cr-autocomplete"
              displayEmpty
              renderValue={(value) => renderValues.get(value)}
              value={value}
              onChange={(event: SelectChangeEvent<number>) => onChange(event.target.value)}
              size={'small'}
              placeholder={'Change Request Id'}
              sx={{ textAlign: 'left', height: changeHeight }}
              error={!!errors.crId}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right'
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                }
              }}
            >
              {approvedChangeRequestOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          )}
        />
        <FormHelperText error>{errors.crId?.message}</FormHelperText>
      </FormControl>
    </Box>
  );
};

export default ChangeRequestDropdown;
