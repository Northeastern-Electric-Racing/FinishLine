/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { ThemeName } from 'shared';
import { useSingleUserSettings, useUpdateUserSettings } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import PageBlock from '../../../layouts/PageBlock';
import ErrorPage from '../../ErrorPage';
import UserSettingsEdit from './UserSettingsEdit';
import UserSettingsView from './UserSettingsView';

interface UserSettingsProps {
  userId: number;
}

export interface FormInput {
  defaultTheme: ThemeName;
  slackId: string;
}

const UserSettings: React.FC<UserSettingsProps> = ({ userId }) => {
  const [edit, setEdit] = useState(false);
  const { isLoading, isError, error, data: userSettingsData } = useSingleUserSettings(userId);
  const update = useUpdateUserSettings();

  if (isLoading || !userSettingsData || update.isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;
  if (update.isError) return <ErrorPage error={update.error!} message={update.error?.message!} />;

  const handleConfirm = async ({ defaultTheme, slackId }: FormInput) => {
    setEdit(false);
    await update.mutateAsync({ id: userSettingsData.id!, defaultTheme, slackId });
  };

  return (
    <PageBlock
      title="User Settings"
      headerRight={
        !edit ? (
          <div role="button" onClick={() => setEdit(true)}>
            <FontAwesomeIcon icon={faPencilAlt} />
          </div>
        ) : (
          <div className="d-flex flex-row">
            <Button className="mr-1" variant="secondary" onClick={() => setEdit(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" form="update-user-settings">
              Save
            </Button>
          </div>
        )
      }
    >
      <Container fluid>
        {!edit ? (
          <UserSettingsView settings={userSettingsData} />
        ) : (
          <UserSettingsEdit currentSettings={userSettingsData} onSubmit={handleConfirm} />
        )}
      </Container>
    </PageBlock>
  );
};

export default UserSettings;
