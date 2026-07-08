import { ChangeRequest, ChangeRequestStatus, isLeadership, User } from 'shared';
import ActionsMenu from '../../components/ActionsMenu';
import { Autocomplete, Checkbox, TextField, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { NERButton } from '../../components/NERButton';
import { useRequestCRReview } from '../../hooks/change-requests.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser, useAllMembers } from '../../hooks/users.hooks';
import { useState } from 'react';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { taskUserToAutocompleteOption } from '../../utils/task.utils';

interface ChangeRequestActionMenuProps {
  isUserAllowedToReview: boolean;
  reviewDisabledTooltip?: string;
  isUserAllowedToDelete: boolean;
  changeRequest: ChangeRequest;
  handleReviewOpen: () => void;
  handleDeleteOpen: () => void;
}

const ChangeRequestActionMenu: React.FC<ChangeRequestActionMenuProps> = ({
  isUserAllowedToReview,
  reviewDisabledTooltip,
  isUserAllowedToDelete,
  changeRequest,
  handleReviewOpen,
  handleDeleteOpen
}: ChangeRequestActionMenuProps) => {
  const { mutateAsync: requestCRReview } = useRequestCRReview(changeRequest.crId.toString());
  const toast = useToast();
  const currentUser = useCurrentUser();
  const [reviewers, setReviewers] = useState(changeRequest.requestedReviewers.map(taskUserToAutocompleteOption));
  const { data: users, isLoading: isLoadingAllUsers, isError: isErrorAllUsers, error: errorAllUsers } = useAllMembers();

  if (isErrorAllUsers) return <ErrorPage message={errorAllUsers?.message} />;
  if (isLoadingAllUsers || !users) return <LoadingIndicator />;

  const handleRequestReviewerClick = async () => {
    if (reviewers.length === 0) {
      toast.error('Must select at least one reviewer to request review from');
    } else {
      try {
        await requestCRReview({ userIds: reviewers.map((user) => user.id) });
        toast.success('Review Successfully Requested!');
      } catch (e) {
        if (e instanceof Error) {
          toast.error(e.message);
        }
      }
    }
  };

  const isRequestAllowed =
    changeRequest.submitter.userId === currentUser.userId && changeRequest.status === ChangeRequestStatus.Open;

  const potentialCrReviewers = (value: User): boolean => {
    return isLeadership(value.role) && value.userId !== currentUser.userId;
  };

  const UnreviewedActionsDropdown = () => (
    <div style={{ marginTop: '10px' }}>
      <ActionsMenu
        buttons={[
          {
            title: 'Review',
            onClick: handleReviewOpen,
            disabled: !isUserAllowedToReview,
            icon: <ContentPasteIcon fontSize="small" />,
            tooltip: reviewDisabledTooltip
          },
          {
            title: 'Delete',
            onClick: handleDeleteOpen,
            disabled: !isUserAllowedToDelete,
            icon: <DeleteIcon fontSize="small" />,
            dividerTop: true
          }
        ]}
      />
    </div>
  );

  const requestReviewerDropdown = () => (
    <>
      <Autocomplete
        isOptionEqualToValue={(option, value) => option.id === value.id}
        limitTags={1}
        disableCloseOnSelect
        multiple
        options={users.filter(potentialCrReviewers).map(taskUserToAutocompleteOption)}
        getOptionLabel={(option) => option.label}
        onChange={(_, values) => setReviewers(values)}
        defaultValue={reviewers}
        renderTags={() => null}
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
          <TextField {...params} variant="standard" placeholder={`${reviewers.length} Reviewers Selected`} />
        )}
      />

      <Box display="flex" flexDirection="row" gap="10px" justifyContent="right">
        <NERButton
          sx={{ mt: '10px', float: 'right' }}
          variant="contained"
          disabled={!isRequestAllowed}
          onClick={handleRequestReviewerClick}
        >
          Request Review
        </NERButton>
        <UnreviewedActionsDropdown />
      </Box>
    </>
  );

  const renderUnreviewedActionsDropdown = () =>
    isRequestAllowed ? requestReviewerDropdown() : <UnreviewedActionsDropdown />;

  return changeRequest.accepted ? null : <>{renderUnreviewedActionsDropdown()}</>;
};

export default ChangeRequestActionMenu;
