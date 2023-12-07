import { ChangeRequest, ChangeRequestStatus, isLeadership, wbsPipe } from 'shared';
import ActionsMenu from '../../components/ActionsMenu';
import { Autocomplete, Checkbox, TextField, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useHistory } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { useRequestCRReview } from '../../hooks/change-requests.hooks';
import { useToast } from '../../hooks/toasts.hooks';
import { useCurrentUser, useAllUsers } from '../../hooks/users.hooks';
import { projectWbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { useState } from 'react';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { taskUserToAutocompleteOption } from '../../utils/task.utils';
import { getUserFullName } from '../../../../backend/src/utils/users.utils';

interface ChangeRequestActionMenuProps {
  isUserAllowedToReview: boolean;
  isUserAllowedToImplement: boolean;
  isUserAllowedToDelete: boolean;
  changeRequest: ChangeRequest;
  handleReviewOpen: () => void;
  handleDeleteOpen: () => void;
}

const ChangeRequestActionMenu: React.FC<ChangeRequestActionMenuProps> = ({
  isUserAllowedToReview,
  isUserAllowedToImplement,
  isUserAllowedToDelete,
  changeRequest,
  handleReviewOpen,
  handleDeleteOpen
}: ChangeRequestActionMenuProps) => {
  const { mutateAsync: requestCRReview } = useRequestCRReview(changeRequest.crId.toString());
  const toast = useToast();
  const currentUser = useCurrentUser();
  const history = useHistory();
  const [reviewerIds, setReviewerIds] = useState<number[]>([]);
  const { data: users, isLoading: isLoadingAllUsers, isError: isErrorAllUsers, error: errorAllUsers } = useAllUsers();

  if (isErrorAllUsers) return <ErrorPage message={errorAllUsers?.message} />;
  if (isLoadingAllUsers || !users) return <LoadingIndicator />;

  const handleRequestReviewerClick = async () => {
    if (reviewerIds.length === 0) {
      toast.error('Must select at least one reviewer to request review from');
    } else {
      try {
        const string = `Review Request Successful for Reviewers ${reviewerIds.map(getUserFullName).join(', ')}`;
        toast.success(string);
      } catch (e) {
        if (e instanceof Error) {
          toast.error(e.message);
        }
      }
    }
  };

  const isRequestAllowed =
    changeRequest.submitter.userId === currentUser.userId && changeRequest.status === ChangeRequestStatus.Open;

  const UnreviewedActionsDropdown = () => (
    <div style={{ marginTop: '10px' }}>
      <ActionsMenu
        buttons={[
          {
            title: 'Review',
            onClick: handleReviewOpen,
            disabled: !isUserAllowedToReview,
            icon: <ContentPasteIcon fontSize="small" />
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
        options={users.filter((user) => isLeadership(user.role)).map(taskUserToAutocompleteOption)}
        getOptionLabel={(option) => option.label}
        onChange={(_, values) => setReviewerIds(values.map((value) => value.id))}
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
          <TextField {...params} variant="standard" placeholder={`${reviewerIds.length} Reviewers Selected`} />
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

  const ImplementCrDropdown = () => (
    <ActionsMenu
      buttons={[
        {
          title: 'Create New Project',
          onClick: () =>
            history.push(`${routes.PROJECTS_NEW}?crId=${changeRequest.crId}&wbs=${projectWbsPipe(changeRequest.wbsNum)}`),
          disabled: !isUserAllowedToImplement,
          icon: <CreateNewFolderIcon fontSize="small" />
        },
        {
          title: 'Create New Work Package',
          onClick: () =>
            history.push(
              `${routes.WORK_PACKAGE_NEW}?crId=${changeRequest.crId}&wbs=${projectWbsPipe(changeRequest.wbsNum)}`
            ),
          disabled: !isUserAllowedToImplement,
          icon: <PostAddIcon fontSize="small" />
        },
        {
          title: `Edit ${changeRequest.wbsNum.workPackageNumber === 0 ? 'Project' : 'Work Package'}`,
          onClick: () =>
            history.push(`${routes.PROJECTS}/${wbsPipe(changeRequest.wbsNum)}?crId=${changeRequest.crId}&edit=${true}`),
          disabled: !isUserAllowedToImplement,
          icon: <EditIcon fontSize="small" />
        }
      ]}
      title="Implement Change Request"
    />
  );

  return changeRequest.accepted ? <ImplementCrDropdown /> : <>{renderUnreviewedActionsDropdown()}</>;
};

export default ChangeRequestActionMenu;
