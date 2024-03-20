import { Autocomplete, Box, Checkbox, Grid, IconButton, TextField, Typography, useTheme } from '@mui/material';
import PageLayout from '../../../components/PageLayout';
import { usersToAvailabilities, existingMeetingData } from '../../../utils/design-review.utils';
import AvailabilityView from './AvailabilityView';
import { useAllUsers, useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { userToAutocompleteOption } from '../../../utils/teams.utils';
import { useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { routes } from '../../../utils/routes';
import { DesignReview, isAdmin, wbsPipe } from 'shared';
import { useDeleteDesignReview } from '../../../hooks/design-reviews.hooks';
import { useHistory } from 'react-router-dom';
import { useToast } from '../../../hooks/toasts.hooks';
import NERModal from '../../../components/NERModal';
import DeleteIcon from '@mui/icons-material/Delete';

interface DesignReviewDetailPageProps {
  designReview: DesignReview;
}

const DesignReviewDetailPage: React.FC<DesignReviewDetailPageProps> = ({ designReview, designReview: { teamType } }) => {
  const theme = useTheme();
  const user = useCurrentUser();
  const { isLoading: allUsersIsLoading, isError: allUsersIsError, error: allUsersError, data: allUsers } = useAllUsers();
  const [requiredUsers, setRequiredUsers] = useState([].map(userToAutocompleteOption));
  const [optionalUsers, setOptionalUsers] = useState([].map(userToAutocompleteOption));
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { mutateAsync: deleteDesignReview } = useDeleteDesignReview(designReview.designReviewId);
  const history = useHistory();
  const toast = useToast();
  if (allUsersIsError) return <ErrorPage message={allUsersError?.message} />;
  if (allUsersIsLoading || !allUsers) return <LoadingIndicator />;
  const designReviewName = `${wbsPipe(designReview.wbsNum)} - ${designReview.wbsName}`;
  const users = allUsers.map(userToAutocompleteOption);

  const handleDelete = () => {
    try {
      deleteDesignReview();
      history.push(routes.CALENDAR);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this design review?</Typography>
      </NERModal>
    );
  };

  const hasDeletePerms = user.userId === designReview.userCreated.userId || isAdmin(user.role);

  return (
    <PageLayout
      headerRight={
        hasDeletePerms && (
          <IconButton onClick={() => setShowDeleteModal(true)}>
            <DeleteIcon />
          </IconButton>
        )
      }
      title="Scheduling"
      previousPages={[
        {
          name: 'Design Review Calendar',
          route: `${routes.CALENDAR}`
        }
      ]}
    >
      <DeleteModal />
      <Grid container spacing={3} display={'flex'} paddingBottom={2}>
        <Grid item xs={1}>
          <Box
            sx={{
              padding: 1.5,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              textAlign: 'center',
              textDecoration: 'underline',
              fontSize: '1.2em'
            }}
          >
            Name
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ padding: 1.5, fontSize: '1.2em', backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
            {designReviewName}
          </Box>
        </Grid>
        <Grid item xs={1}>
          <Box
            sx={{
              padding: 1,
              paddingTop: 1.5,
              paddingBottom: 1.5,
              fontSize: '1.2em',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              textAlign: 'center',
              textDecoration: 'underline'
            }}
          >
            Required
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ padding: 1, backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
            <Autocomplete
              isOptionEqualToValue={(option, value) => option.id === value.id}
              multiple
              disableCloseOnSelect
              limitTags={1}
              renderTags={() => null}
              id="required-users"
              options={users.filter((user) => !optionalUsers.some((optUser) => optUser.id === user.id))}
              value={requiredUsers}
              onChange={(_event, newValue) => setRequiredUsers(newValue)}
              getOptionLabel={(option) => option.label}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} variant="standard" placeholder={`${requiredUsers.length} users selected`} />
              )}
            />
          </Box>
        </Grid>
        <Grid item xs={1}>
          <Box
            sx={{
              padding: 1,
              paddingTop: 1.5,
              paddingBottom: 1.5,
              backgroundColor: theme.palette.background.paper,
              borderRadius: 3,
              textAlign: 'center',
              textDecoration: 'underline',
              fontSize: '1.2em'
            }}
          >
            Optional
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Box sx={{ padding: 1, backgroundColor: 'grey', borderRadius: 3, textAlign: 'center' }}>
            <Autocomplete
              isOptionEqualToValue={(option, value) => option.id === value.id}
              multiple
              disableCloseOnSelect
              limitTags={1}
              renderTags={() => null}
              id="optional-users"
              options={users.filter((user) => !requiredUsers.some((reqUser) => reqUser.id === user.id))}
              value={optionalUsers}
              onChange={(_event, newValue) => setOptionalUsers(newValue)}
              getOptionLabel={(option) => option.label}
              renderOption={(props, option, { selected }) => (
                <li {...props}>
                  <Checkbox
                    icon={<CheckBoxOutlineBlankIcon />}
                    checkedIcon={<CheckBoxIcon />}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} variant="standard" placeholder={`${optionalUsers.length} users selected`} />
              )}
            />
          </Box>
        </Grid>
      </Grid>
      <AvailabilityView
        title={'Battery'}
        usersToAvailabilities={usersToAvailabilities}
        existingMeetingData={existingMeetingData}
      />
    </PageLayout>
  );
};

export default DesignReviewDetailPage;
