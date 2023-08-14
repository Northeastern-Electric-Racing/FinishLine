import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { isWithinInterval, subDays } from 'date-fns';
import { Control, Controller } from 'react-hook-form';
import { wbsPipe } from 'shared';
import { useAllChangeRequests } from '../hooks/change-requests.hooks';
import LoadingIndicator from './LoadingIndicator';
import { useCurrentUser } from '../hooks/users.hooks';

interface ChangeRequestDropdownProps {
  control: Control<any, any>;
  name: string;
}

const ChangeRequestDropdown = ({ control, name }: ChangeRequestDropdownProps) => {
  const user = useCurrentUser();
  const { isLoading, data: changeRequests } = useAllChangeRequests();
  if (isLoading || !changeRequests) return <LoadingIndicator />;

  const today = new Date();
  const fiveDaysAgo = subDays(today, 5);

  const filteredRequests = changeRequests?.filter(
    (cr) => cr.dateReviewed && cr.accepted && isWithinInterval(cr.dateReviewed, { start: fiveDaysAgo, end: today })
  );

  // The current user's CRs should be at the top
  filteredRequests.sort((a, b) => {
    const isSubmitterAUser = a.submitter.firstName === user.firstName && a.submitter.lastName === user.lastName;
    const isSubmitterBUser = b.submitter.firstName === user.firstName && b.submitter.lastName === user.lastName;

    if (isSubmitterAUser && isSubmitterBUser) return 0;
    if (isSubmitterAUser) return -1;
    if (isSubmitterBUser) return 1;

    return a.crId - b.crId;
  });

  const approvedChangeRequestOptions =
    filteredRequests.map((cr) => ({
      label: `${cr.crId} - ${wbsPipe(cr.wbsNum)} - ${cr.submitter.firstName} ${cr.submitter.lastName} - ${cr.type}`,
      value: cr.crId
    })) ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Select
          id="cr-autocomplete"
          displayEmpty
          renderValue={(value) => (value ? value : 'Change Request Id')}
          value={value}
          onChange={(event: SelectChangeEvent<number>) => {
            const {
              target: { value }
            } = event;
            if (value) onChange(value);
          }}
          size={'small'}
          placeholder={'Change Request Id'}
          sx={{ width: 200, textAlign: 'left' }}
        >
          {approvedChangeRequestOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      )}
    />
  );
};

export default ChangeRequestDropdown;
