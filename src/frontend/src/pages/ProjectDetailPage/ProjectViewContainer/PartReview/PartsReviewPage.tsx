import LoadingIndicator from '../../../../components/LoadingIndicator';
import { Box, Stack } from '@mui/system';
import { Grid, FormControlLabel, Autocomplete, TextField, Button, Chip, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useAllUsers, useCurrentUser } from '../../../../hooks/users.hooks';
import { Project, rankUserRole, Review_Status, wbsPipe } from 'shared';
import NERSwitch from '../../../../components/NERSwitch';
import PartDisplay from '../../../PartPage/PartPageComponents/PartDisplay';
import { useGetAllPartTags, usePartsFromProject } from '../../../../hooks/part-review.hooks';
import ErrorPage from '../../../ErrorPage';
import { Link as RouterLink } from 'react-router-dom';
import CreateMenu from './PartReviewComponents/PartFormModels/CreateMenu';
import SubmissionGuide from './PartReviewComponents/SubmissionGuide';
import { PartPreviewCard } from './PartReviewComponents/PartPreviewCard';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const PartsReviewPage = ({ project }: { project: Project }) => {
  const currentUser = useCurrentUser();
  const [showSubmissionGuide, setShowSubmissionGuide] = useState(() => {
    const userRole = currentUser.role;
    return rankUserRole(userRole) < rankUserRole('LEADERSHIP');
  });
  const { data: parts, isLoading, isError, error } = usePartsFromProject(wbsPipe(project.wbsNum));
  const { data: tags, isLoading: tagsLoading, isError: tagsIsError, error: tagsError } = useGetAllPartTags();
  const { data: users, isLoading: usersLoading, isError: usersIsError, error: usersError } = useAllUsers();

  // filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [statuses, setStatuses] = useState<Review_Status[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [reviewerIds, setReviewerIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);

  const filteredParts = useMemo(() => {
    return parts?.filter((part) => {
      if (statuses.length !== 0 && !statuses.includes(part.status)) return false;
      if (assigneeIds.length !== 0 && !assigneeIds.some((id) => part.assignees.some((assignee) => assignee.userId === id)))
        return false;
      if (
        reviewerIds.length !== 0 &&
        !reviewerIds.some((id) => part.reviewRequests.some((reviewRequest) => reviewRequest.reviewerRequested.userId === id))
      ) {
        return false;
      }
      if (tagIds.length !== 0 && !tagIds.some((id) => part.tags.some((tag) => tag.partTagId === id))) return false;
      if (searchValue.length !== 0 && !part.commonName.toLowerCase().includes(searchValue.toLowerCase())) return false;
      return true;
    });
  }, [parts, statuses, assigneeIds, reviewerIds, tagIds, searchValue]);

  if (isLoading || !parts || tagsLoading || !tags || usersLoading || !users) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;
  if (tagsIsError) return <ErrorPage message={tagsError?.message} />;
  if (usersIsError) return <ErrorPage message={usersError?.message} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <CreateMenu wbsNum={project.wbsNum} partsInProject={parts} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SearchIcon sx={{ fontSize: '1.5rem' }} />
          <Autocomplete
            freeSolo
            disableClearable
            options={[]}
            value={searchValue}
            onInputChange={(_event, newValue) => setSearchValue(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Search..."
                variant="standard"
                sx={{
                  width: '10rem',
                  '& .MuiOutlinedInput-root': {
                    height: '2.25rem'
                  }
                }}
              />
            )}
          />
        </Box>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          sx={{
            height: '2.25rem'
          }}
        >
          <FilterListIcon fontSize="medium" />
          <Typography fontSize={'0.75rem'} align="center">
            Filters
          </Typography>
        </Button>
        <FormControlLabel
          label="View Submission Guide?"
          control={
            <NERSwitch
              sx={{ m: 1 }}
              checked={showSubmissionGuide}
              onChange={() => setShowSubmissionGuide(!showSubmissionGuide)}
            />
          }
        />
      </Box>
      {showFilters && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Autocomplete
            multiple
            size="small"
            options={Object.values(Review_Status)}
            value={statuses}
            onChange={(_event, newValue) => setStatuses(newValue)}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Status" placeholder="Filter by status" />
            )}
            renderTags={(value, getTagProps) => (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  gap: 0.5,
                  '&::-webkit-scrollbar': {
                    height: 8,
                    background: 'transparent'
                  }
                }}
              >
                {value.map((option, index) => (
                  <Chip
                    size="small"
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                    sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
            sx={{ width: '20%' }}
          />
          <Autocomplete
            multiple
            size="small"
            options={users}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            onChange={(_event, value) => {
              const selectedIds = value.map((user) => user.userId);
              setAssigneeIds(selectedIds.length ? selectedIds : []);
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Assignees" placeholder="Select Assignees" error={false} />
            )}
            renderTags={(value, getTagProps) => (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  gap: 0.5,
                  '&::-webkit-scrollbar': {
                    height: 8,
                    background: 'transparent'
                  }
                }}
              >
                {value.map((option, index) => (
                  <Chip
                    size="small"
                    label={`${option.firstName} ${option.lastName}`}
                    {...getTagProps({ index })}
                    key={option.userId}
                    sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
            sx={{ width: '20%' }}
          />
          <Autocomplete
            multiple
            size="small"
            options={users}
            getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
            onChange={(_event, value) => {
              const selectedIds = value.map((user) => user.userId);
              setReviewerIds(selectedIds);
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Reviewers" placeholder="Select Reviewers" error={false} />
            )}
            renderTags={(value, getTagProps) => (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  gap: 0.5,
                  '&::-webkit-scrollbar': {
                    height: 8,
                    background: 'transparent'
                  }
                }}
              >
                {value.map((option, index) => (
                  <Chip
                    size="small"
                    label={`${option.firstName} ${option.lastName}`}
                    {...getTagProps({ index })}
                    key={option.userId}
                    sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
            sx={{ width: '20%' }}
          />
          <Autocomplete
            multiple
            size="small"
            options={tags}
            getOptionLabel={(tag) => tag.name}
            onChange={(_event, value) => {
              const selectedIds = value.map((tag) => tag.partTagId);
              setTagIds(selectedIds);
            }}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Tags" placeholder="Select Tags" error={false} />
            )}
            renderTags={(value, getTagProps) => (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  gap: 0.5,
                  '&::-webkit-scrollbar': {
                    height: 8,
                    background: 'transparent'
                  }
                }}
              >
                {value.map((option, index) => (
                  <Chip
                    size="small"
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.partTagId}
                    sx={{ whiteSpace: 'nowrap', flexShrink: 0, fontSize: '0.75rem' }}
                  />
                ))}
              </Box>
            )}
            sx={{ width: '20%' }}
          />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {/* The guide should be toggled off by default for admins, heads, and leads and toggled on for all other roles */}
          {showSubmissionGuide && (
            <SubmissionGuide />
          )}
          <Typography variant="h4" sx={{ mb: 2 }}>
            {`${filteredParts?.length === parts.length ? 'All ' : ''} Parts for ${project.name}`}
          </Typography>
          <Grid container spacing={3}>
            {/* sort parts by most recently created */}
            {filteredParts
              ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((part, _index) => (
                <Grid item md={4} sm={6} xs={12}>
                  <PartPreviewCard
                    partPreview={part}
                    projectName={project.abbreviation ?? project.name}
                    redirectUrl={`/projects/${wbsPipe(project.wbsNum)}/part/${part.index}`}
                  />
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartsReviewPage;
