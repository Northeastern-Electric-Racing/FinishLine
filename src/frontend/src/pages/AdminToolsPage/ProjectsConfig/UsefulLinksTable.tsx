import { TableRow, TableCell, Box, IconButton, Typography } from '@mui/material';
import AdminToolTable from '../AdminToolTable';
import { NERButton } from '../../../components/NERButton';
import { isAdmin } from 'shared/src/permission-utils';
import { useCurrentUser } from '../../../hooks/users.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { Delete } from '@mui/icons-material';
import { useState } from 'react';
import NERModal from '../../../components/NERModal';
import { Link } from 'shared';
import { useAllUsefulLinks, useSetUsefulLinks } from '../../../hooks/projects.hooks';

const linkToLinkCreateArgs = (links: Link[]) => {
  return links.map((link) => {
    return {
      linkId: link.linkId,
      linkTypeName: 'Confluence',
      url: link.url
    };
  });
};

const UsefulLinksTable = () => {
  const currentUser = useCurrentUser();
  const {
    data: usefulLinks,
    isLoading: usefulLinksIsLoading,
    isError: usefulLinksIsError,
    error: usefulLinksError
  } = useAllUsefulLinks();

  const [linkToDelete, setLinkToDelete] = useState<Link>();

  const { mutateAsync } = useSetUsefulLinks();

  if (!usefulLinks || usefulLinksIsLoading) return <LoadingIndicator />;
  if (usefulLinksIsError) return <ErrorPage message={usefulLinksError.message} />;

  const handleDelete = (allLinks: Link[], linkToDelete: Link) => {
    const updatedLinks = allLinks.filter((link) => link.linkId !== linkToDelete.linkId);
    mutateAsync(linkToLinkCreateArgs(updatedLinks));
    setLinkToDelete(undefined);
  };


  const usefulLinkRows = usefulLinks.map((link) => (
    <TableRow>
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {link.linkType.name}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>{link.url}</TableCell>
      <TableCell align="center" sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <IconButton onClick={() => setLinkToDelete(link)}>
          <Delete />
        </IconButton>
      </TableCell>
    </TableRow>
  ));

  return (
    <>
      <Box>
        <AdminToolTable columns={[{ name: 'Name' }, { name: 'Description' }, { name: '' }]} rows={usefulLinkRows} />
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
          {isAdmin(currentUser.role) && <NERButton variant="contained">New Useful Link</NERButton>}
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
          Are you sure you want to delete the link <i>{linkToDelete?.linkType}</i>?
        </Typography>
        <Typography fontWeight="bold">This action cannot be undone!</Typography>
      </NERModal>
    </>
  );
};

export default UsefulLinksTable;
