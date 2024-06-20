import { TableRow, TableCell, Box, IconButton, Typography } from '@mui/material';
import AdminToolTable from '../../AdminToolTable';
import { NERButton } from '../../../../components/NERButton';
import { isAdmin } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';
import { Delete } from '@mui/icons-material';
import { useState } from 'react';
import NERModal from '../../../../components/NERModal';
import { Link } from 'shared';
import { useAllUsefulLinks, useSetUsefulLinks } from '../../../../hooks/projects.hooks';
import { useAllLinkTypes } from '../../../../hooks/projects.hooks';
import CreateUsefulLinkModal from './CreateUsefulLinkModal';
import EditUsefulLinkModal from './EditUsefulLinkModal';
import { linkToLinkCreateArgs } from '../../../../utils/link.utils';

const UsefulLinksTable = () => {
  const currentUser = useCurrentUser();
  const {
    data: usefulLinks,
    isLoading: usefulLinksIsLoading,
    isError: usefulLinksIsError,
    error: usefulLinksError
  } = useAllUsefulLinks();
  const { mutateAsync } = useSetUsefulLinks();
  const { data: linkTypes, isLoading: linkTypesIsLoading } = useAllLinkTypes();

  const [linkToDelete, setLinkToDelete] = useState<Link>();
  const [clickedLink, setClickedLink] = useState<Link>();
  const [showCreateModel, setShowCreateModel] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  if (!usefulLinks || usefulLinksIsLoading || !linkTypes || linkTypesIsLoading) return <LoadingIndicator />;
  if (usefulLinksIsError) return <ErrorPage message={usefulLinksError.message} />;

  const handleDelete = (allLinks: Link[], linkToDelete: Link) => {
    const updatedLinks = allLinks.filter((link) => link.linkId !== linkToDelete.linkId);
    mutateAsync(linkToLinkCreateArgs(updatedLinks));
    setLinkToDelete(undefined);
  };

  const usefulLinkRows = usefulLinks.map((link) => (
    <TableRow
      onClick={() => {
        setShowEditModal(true);
        return setClickedLink(link);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {link.linkType.name}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>{link.url}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            return setLinkToDelete(link);
          }}
        >
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateUsefulLinkModal
        open={showCreateModel}
        handleClose={() => setShowCreateModel(false)}
        linkTypes={linkTypes}
        currentLinks={usefulLinks}
      />
      {clickedLink && (
        <EditUsefulLinkModal
          open={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setClickedLink(undefined);
          }}
          linkType={clickedLink}
          linkTypes={linkTypes}
          currentLinks={usefulLinks}
        />
      )}

      <Box>
        <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }, { name: '' }]} rows={usefulLinkRows} />
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
          {isAdmin(currentUser.role) && (
            <NERButton onClick={() => setShowCreateModel(true)} variant="contained">
              New Useful Link
            </NERButton>
          )}
        </Box>
      </Box>
      <NERModal
        open={!!linkToDelete}
        title="Warning!"
        onHide={() => setLinkToDelete(undefined)}
        submitText="Delete"
        onSubmit={() => {
          handleDelete(usefulLinks, linkToDelete!);
        }}
      >
        <Typography gutterBottom>
          Are you sure you want to delete the link <i>{linkToDelete?.linkType.name}</i>?
        </Typography>
        <Typography fontWeight="bold">This action cannot be undone!</Typography>
      </NERModal>
    </Box>
  );
};

export default UsefulLinksTable;
