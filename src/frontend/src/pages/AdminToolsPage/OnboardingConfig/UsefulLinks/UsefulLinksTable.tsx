import { TableRow, TableCell, Box, IconButton, Typography, Link as LinkComponent, Table, TableBody, TableHead } from '@mui/material';
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
import NERDeleteModal from '../../../../components/NERDeleteModal';

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
  const [editingLink, setEditingLink] = useState<Link>();
  const [showCreateModel, setShowCreateModel] = useState<boolean>(false);

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
        return setEditingLink(link);
      }}
      sx={{ cursor: 'pointer' }}
    >
      <TableCell align="left" sx={{ border: '2px solid black' }}>
        {link.linkType.name}
      </TableCell>
      <TableCell sx={{ border: '2px solid black', verticalAlign: 'middle' }}>
        <LinkComponent sx={{ color: 'white', textDecorationColor: 'white' }} href={link.url} target="_blank">
          {link.url}
        </LinkComponent>
      </TableCell>
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
      {editingLink && (
        <EditUsefulLinkModal
          open={!!editingLink}
          handleClose={() => {
            setEditingLink(undefined);
          }}
          linkType={editingLink}
          linkTypes={linkTypes}
          currentLinks={usefulLinks}
        />
      )}

      <Box>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px'
              }}
            >
              Question
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Answer
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usefulLinkRows}
        </TableBody>
        </Table>
        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
          {isAdmin(currentUser.role) && (
            <NERButton onClick={() => setShowCreateModel(true)} variant="contained">
              New Useful Link
            </NERButton>
          )}
        </Box>
      </Box>
      <NERDeleteModal
        open={!!linkToDelete}
        onHide={() => setLinkToDelete(undefined)}
        formId="delete-item-form"
        dataType="FAQ"
        onFormSubmit={() => {
          if (linkToDelete) {
            handleDelete(usefulLinks, linkToDelete);
          }
        }}
      />
    </Box>
  );
};

export default UsefulLinksTable;
