import { Control, Controller } from 'react-hook-form';
import { wbsPipe } from 'shared';
import { useAllChangeRequests } from '../hooks/change-requests.hooks';
import NERAutocomplete from './NERAutocomplete';

interface ChangeRequestDropdownProps {
  control: Control<any, any>;
  name: string;
}

const ChangeRequestDropdown = ({ control, name }: ChangeRequestDropdownProps) => {
  const { data: changeRequests } = useAllChangeRequests();
  const options =
    changeRequests
      ?.filter((cr) => cr.accepted)
      .map((cr) => ({
        label: `${cr.crId} - ${wbsPipe(cr.wbsNum)} - ${cr.submitter.firstName} ${cr.submitter.lastName}`,
        id: `${cr.crId}`
      })) ?? [];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, name } }) => (
        <NERAutocomplete
          id="cr"
          options={options}
          value={options.find((option) => option.id === value)}
          onChange={(event, value) => {
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
