/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import * as yup from 'yup';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { PreferencesFormInput } from './UserOtherPref';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ThemeName } from 'shared';

interface UserPreferencesEditProps {
  onSubmit: (data: PreferencesFormInput) => Promise<void>;
}

const schema = yup.object().shape({
  defaultTheme: yup
    .mixed<ThemeName>()
    .oneOf(['DARK', 'LIGHT'], 'Invalid theme chosen')
    .required('Default theme is required'),
  slackId: yup.string().required('Slack ID is required')
});

const UserOtherPrefEdit: React.FC<UserPreferencesEditProps> = ({ onSubmit }) => {
  const { handleSubmit } = useForm<PreferencesFormInput>({
    resolver: yupResolver(schema)
  });

  return (
    <form id={'update-user-preferences'} onSubmit={handleSubmit(onSubmit)}>
      <FormControl>
        <FormLabel id="default-theme-radio">Display</FormLabel>
        <RadioGroup aria-labelledby="default-theme-radio" defaultValue="light" name="default-theme">
          <FormControlLabel value="light" control={<Radio />} label="Light" />
          <FormControlLabel value="dark" control={<Radio />} label="Dark" />
        </RadioGroup>
      </FormControl>
    </form>
  );
};

export default UserOtherPrefEdit;
