import { Box, Typography, IconButton, Chip, Stack } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useSinglePart } from '../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { Part, Review_Status } from 'shared';

/**
 * gets the status color for each status case
 * (should probably export/reposition later for better placement as a parts utils function)
*/
const getReviewStatusColor = (status: Review_Status) => {
    switch (status) {
      case 'IN_PROGRESS':
        return '#FF7700'; 
      case 'READY_FOR_REVIEW':
        return '#FF5500';    
      case 'IN_REVIEW':
        return '#F57600';  
      case 'REVIEWED':
        return '#3DA848';  
      case 'APPROVED':
        return '#D633FF';   
      default:
        return '#535151';
    }
  };
  

/**
 * converts a status to a string name format
 * (should probably export/reposition later for better placement as a parts utils function)
*/
const getReviewStatusName = (status: Review_Status) => {
switch (status) {
    case 'IN_PROGRESS':
    return 'Review In Progress'; 
    case 'READY_FOR_REVIEW':
    return 'Ready For Review';    
    case 'IN_REVIEW':
    return 'In Review';  
    case 'REVIEWED':
    return 'Reviewed';  
    case 'APPROVED':
    return 'Approved';   
    default:
    return 'N/A';
}
};

/**
 * get status color of a reviewer
 */ 
function getReviewerDotColor(data: Part, reviewerId: String) {
    const hasReviewed = data.submissions.some(submission => 
      submission.reviews.some(review => 
        review.userCreated.userId === reviewerId && review.completedAt
      )
    );
    if (hasReviewed) {
      return '#33CC33';
    }
    const isWriting = data.submissions.some(submission => 
      submission.reviews.some(review => 
        review.userCreated.userId === reviewerId && !review.completedAt
      )
    );
    if (isWriting) {
      return '#FFAA00';
    }
    return '#FF3333';
  }

const PartPageOverview: React.FC = () => {
    const { isLoading, data: part, isError, error } = useSinglePart();
    
    if (isLoading) {
        return <LoadingIndicator />;
      }
    
    if (isError || !part) {
        throw error;
    }

    const statusColor: string = getReviewStatusColor(part.status);
    const statusName: string = getReviewStatusName(part.status);
    
  return (
        <Box
            sx={{
                backgroundColor: 'transparent',
                width: '100%',
                borderRadius: 2,
                display: 'flex-col',
                mb: 2
            }}
        >
            <Typography variant="h5" mb={1}>Overview</Typography>
            <Typography mb={0.5}>{part.description}</Typography>
            <Typography mb={2.5}>
                {part.tags.map((tag, idx) => (
                    <Chip
                        key={idx}
                        label={tag.name}
                        size="small"
                        sx={{
                        backgroundColor: tag.colorHexCode,
                        mr: 1,
                        }}
                    />
                ))}
            </Typography>
            <Typography mb={1.5} sx={{ display: 'flex', alignItems: 'center' }}>
                Current Status: 
                <Chip
                    label = {statusName}
                    sx={{
                    backgroundColor: statusColor,
                    ml: 1.5,
                    width: 150
                    }}
                />
            </Typography>
            <Box
                sx={{
                    backgroundColor: 'transparent',
                    width: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    mb: 2
                }}
            >
                <Stack direction={'column'} spacing={0.5} width='50%'>
                    <Typography>Assignees:</Typography>
                    {part.assignees.map((user) => (
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                size = 'small'
                                onClick= {(e) => {
                                    e.currentTarget.style.backgroundColor = '#FF0000';
                                    e.currentTarget.disabled = true;
                                }}
                                sx={{
                                    backgroundColor: '#444444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    '&:hover': {
                                    backgroundColor: '#555555',
                                    },
                                    mr: 1
                                }}
                                >
                                <NotificationsNoneIcon fontSize='inherit'/>
                            </IconButton>
                            <Typography>{user.firstName} {user.lastName}]</Typography>
                        </Typography> 
                    ))}
                </Stack>
                <Stack direction={'column'} spacing={0.5} width='50%'>
                    <Typography>
                        Reviewers:
                    </Typography>
                    {part.reviewRequests.map((revReq) => (
                        <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                size = 'small'
                                onClick= {(e) => {
                                    e.currentTarget.style.backgroundColor = '#FF0000';
                                    e.currentTarget.disabled = true;
                                }}
                                sx={{
                                    backgroundColor: '#444444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    '&:hover': {
                                    backgroundColor: '#555555',
                                    },
                                    mr: 1
                                }}
                                >
                                <NotificationsNoneIcon fontSize='inherit'/>
                            </IconButton>
                            <Typography>
                                {revReq.reviewerRequested.firstName} {revReq.reviewerRequested.lastName}
                            </Typography>
                            <Box
                                sx={{
                                    width: '10px',
                                    height: '10px',
                                    ml: 0.5,
                                    borderRadius: '50%',
                                    backgroundColor: getReviewerDotColor(part, revReq.reviewerRequested.userId),
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                >
                            </Box>
                        </Typography> 
                    ))}
                </Stack>
            </Box>
        </Box>
  );
};

export default PartPageOverview;
