import { Box } from '@mui/system';
import { isHead, isLead, Part, Project, Review_Status, RoleEnum, WbsElementStatus, wbsPipe } from 'shared';
import { Grid, Typography } from '@mui/material';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { usePartsFromProject } from '../../../hooks/part-review.hooks';

interface AllPartsUnderReview {
  project: Project;
}

const AllPartsUnderReviewContainer: React.FC<AllPartsUnderReview> = ({ project }) => {
  // check if current user is head or lead for this project
  const currentUser = useCurrentUser();
  const { wbsNum } = project;
  const { data } = usePartsFromProject(wbsPipe(wbsNum));
  // all heads for this project
  const projectHeads = project.teams.map((team) => team.head);
  // all leads for this project
  const projectLeads = project.teams
    .map((team) => team.leads)
    .reduce((accumLeads, currTeamLeads) => accumLeads.concat(currTeamLeads));

  const isUserHead = isHead(currentUser.role) && projectHeads.includes(currentUser);
  const isUserLead = isLead(currentUser.role) && projectLeads.includes(currentUser);

  // filter out parts in project that have not been approved
  const parts = data?.filter((part) => part.status !== Review_Status.APPROVED) || [];
  // show list only if head/lead of current project

  if (!(isUserHead || isUserLead) || parts.length === 0) {
    return null;
  }
  return (
    <Grid item xs={12}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        My Parts Under Review ({parts.length})
      </Typography>
      <Box
        sx={{
          maxHeight: '200px',
          maxWidth: '100%',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#333333'
        }}
      >
        <Grid container spacing={1}>
          <Grid item xs={6} sm={3} md={2} display={{ xs: 'block', sm: 'block', md: 'block' }}>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Part Name
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'block', md: 'block' }}>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Assignee(s)
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'block', md: 'block' }}>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Reviewer(s)
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'none', md: 'block' }}>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Latest Submission From
            </Typography>
          </Grid>
          <Grid item sm={3} md={2} display={{ xs: 'none', sm: 'none', md: 'block' }}>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Latest Review From
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3} md={2} display={{ xs: 'block', sm: 'block', md: 'block' }}>
            <Typography variant="h6" sx={{ ml: 2 }}>
              Review Status
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          maxHeight: '200px',
          maxWidth: '100%',
          overflowY: 'scroll',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#ef4244',
            borderRadius: '4px'
          }
        }}
      >
        <Grid container spacing={1}>
          {parts.map((part) => (
            // replace this with actual part under review component
            <Grid item xs={12} key={part.partId}>
              <Box
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <Typography variant="h6">{part.commonName}</Typography>
                <Typography variant="body2">{part.description}</Typography>
                <Typography variant="body2">Status: {part.status}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Grid>
  );
};

export default AllPartsUnderReviewContainer;
