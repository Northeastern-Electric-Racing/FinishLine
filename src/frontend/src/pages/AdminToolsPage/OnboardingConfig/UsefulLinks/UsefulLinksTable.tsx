import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  Typography,
  Link as LinkComponent,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Button
} from '@mui/material';
import { isAdmin } from 'shared';
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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface UsefulLinksTableProps {
  isOnGuestHomePage?: boolean;
  isOnNewMemberDashboard?: boolean;
  isOnOnboardingDashboard?: boolean;
}

const UsefulLinksTable = ({ isOnGuestHomePage, isOnNewMemberDashboard, isOnOnboardingDashboard }: UsefulLinksTableProps) => {
  const currentUser = useCurrentUser();
  const {
    data: links,
    isLoading: usefulLinksIsLoading,
    isError: usefulLinksIsError,
    error: usefulLinksError
  } = useAllUsefulLinks();
  const { mutateAsync } = useSetUsefulLinks();
  const { data: linkTypesBeforeFilter, isLoading: linkTypesIsLoading } = useAllLinkTypes();

  const [linkToDelete, setLinkToDelete] = useState<Link>();
  const [editingLink, setEditingLink] = useState<Link>();
  const [showCreateModel, setShowCreateModel] = useState<boolean>(false);

  if (!links || usefulLinksIsLoading || !linkTypesBeforeFilter || linkTypesIsLoading) return <LoadingIndicator />;
  if (usefulLinksIsError) return <ErrorPage message={usefulLinksError.message} />;

  const handleDelete = (allLinks: Link[], linkToDelete: Link) => {
    const updatedLinks = allLinks.filter((link) => link.linkId !== linkToDelete.linkId);
    mutateAsync(linkToLinkCreateArgs(updatedLinks));
    setLinkToDelete(undefined);
  };

  const matchesDashboard = (linkType?: {
    isOnGuestHomePage: boolean;
    isOnNewMemberDashboard: boolean;
    isOnOnboardingDashboard: boolean;
  }) => {
    if (!linkType) return false;
    if (isOnNewMemberDashboard) return linkType.isOnNewMemberDashboard;
    if (isOnOnboardingDashboard) return linkType.isOnOnboardingDashboard;
    if (isOnGuestHomePage) return linkType.isOnGuestHomePage;
    return !linkType.isOnGuestHomePage && !linkType.isOnNewMemberDashboard && !linkType.isOnOnboardingDashboard;
  };

  const linkTypes = linkTypesBeforeFilter.filter(matchesDashboard);

  const usefulLinks = links.filter((link) => matchesDashboard(link.linkType));

  return (
    <Box>
      <CreateUsefulLinkModal
        open={showCreateModel}
        handleClose={() => setShowCreateModel(false)}
        linkTypes={linkTypes}
        currentLinks={links}
      />
      {editingLink && (
        <EditUsefulLinkModal
          open={!!editingLink}
          handleClose={() => {
            setEditingLink(undefined);
          }}
          linkType={editingLink}
          linkTypes={linkTypes}
          currentLinks={links}
        />
      )}

      <Box>
        <TableContainer sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          <Table sx={{ '& td, & th': { borderBottom: 'none' } }}>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid white', color: 'white' }}>
                <TableCell sx={{ borderRight: '2px solid white', color: 'white' }}>Link Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell sx={{ color: 'white' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usefulLinks.map((link) => (
                <TableRow key={link.linkId} onClick={() => setEditingLink(link)} sx={{ cursor: 'pointer' }}>
                  <TableCell align="left" sx={{ color: 'white' }}>
                    {link.linkType.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderLeft: '2px solid white',
                      color: 'white',
                      verticalAlign: 'middle'
                    }}
                  >
                    <LinkComponent sx={{ color: 'white', textDecorationColor: 'white' }} href={link.url} target="_blank">
                      {link.url}
                    </LinkComponent>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: 'white',
                      verticalAlign: 'middle'
                    }}
                  >
                    <IconButton
                      onClick={(event) => {
                        event.stopPropagation();
                        return setLinkToDelete(link);
                      }}
                    >
                      <Delete sx={{ color: 'white' }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
          {isAdmin(currentUser.role) && (
            <Button
              onClick={() => setShowCreateModel(true)}
              variant="text"
              startIcon={<AddCircleOutlineIcon />}
              sx={{
                color: '#ef4345',
                '&:hover': {
                  backgroundColor: 'transparent'
                }
              }}
            >
              Add Link
            </Button>
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
