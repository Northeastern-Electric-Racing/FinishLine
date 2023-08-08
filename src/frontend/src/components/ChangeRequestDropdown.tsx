import { Control, Controller } from 'react-hook-form';
import { subDays, isWithinInterval } from 'date-fns';
import { wbsPipe } from 'shared';
import { useAllChangeRequests } from '../hooks/change-requests.hooks';
import NERAutocomplete from './NERAutocomplete';
import LoadingIndicator from './LoadingIndicator';

interface ChangeRequestDropdownProps {
  control: Control<any, any>;
  name: string;
}

const ChangeRequestDropdown = ({ control, name }: ChangeRequestDropdownProps) => {
  const { isLoading, data: changeRequests } = useAllChangeRequests();
  if (isLoading || !changeRequests) return <LoadingIndicator />;

  const today = new Date();
  const fiveDaysAgo = subDays(today, 5);

  const options =
    changeRequests
      ?.filter((cr) => !!cr.dateReviewed && isWithinInterval(cr.dateReviewed, { start: fiveDaysAgo, end: today }))
      .map((cr) => ({
        label: `${cr.crId} - ${wbsPipe(cr.wbsNum)} - ${cr.submitter.firstName} ${cr.submitter.lastName}`,
        id: `${cr.crId}`
      })) ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <NERAutocomplete
          id="cr-autocomplete"
          options={options}
          value={options.find((option) => option.id === value)}
          onChange={(_event, value) => {
            if (value) onChange(value.id);
          }}
          size={'small'}
          placeholder={'Change Request Id'}
        />
      )}
    />
  );
};

export default ChangeRequestDropdown;
