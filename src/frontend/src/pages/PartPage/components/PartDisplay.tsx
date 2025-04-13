import { Box, Typography, Grid, Breadcrumbs } from '@mui/material';
import { Part, Review_Status } from 'shared';
import { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';

interface PartDisplayProps {
  part: Part;
}

const ScreenSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

const PartDisplay: React.FC<PartDisplayProps> = ({ part }) => {
  const screenSize = ScreenSize.LARGE;

  switch (screenSize) {
    case ScreenSize.SMALL:
      return (
        <Box style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
            <Typography>{part.commonName}</Typography>
            <Typography>"Last Updated By "{part.submissions[0]}</Typography>
          </div>
          <div style={{ flex: 1, padding: '10px' }}>
            <Chip color={part.status === Review_Status.REVIEWED ? 'success' : 'error'} label={part.status}></Chip>
          </div>
        </Box>
      );

    case ScreenSize.MEDIUM:
      return (
        <Box style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
            <Typography>{part.commonName}</Typography>
            <Typography>"Last Updated By "{part.submissions[0]}</Typography>
          </div>

          {/* Assignees */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px' }}>
            {part.assignees.map((assignee) => (
              <Typography>
                {assignee.firstName} {assignee.lastName}
              </Typography>
            ))}
          </div>

          {/* Reviewers */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px' }}>
            {part.submissions[0].reviews.map((review) => (
              <Typography>
                {review.userCreated.firstName} {review.userCreated.lastName}
              </Typography>
            ))}
          </div>

          <div style={{ flex: 1, padding: '10px' }}>
            <Chip color={part.status === Review_Status.REVIEWED ? 'success' : 'error'} label={part.status}></Chip>
          </div>
        </Box>
      );


    {/*full screen*/}
    default:
      return (
        <Box style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ flex: 1, padding: '10px' }}>{part.commonName}</div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '10px' }}>
            {part.assignees.map((assignee) => (
              <Typography>
                {assignee.firstName} {assignee.lastName}
              </Typography>
            ))}
          </div>
          <div style={{ flex: 1, padding: '10px' }}>{part.submissions[0]}</div>
          <div style={{ flex: 1, padding: '10px' }}>{part.reviewRequests[0].reviewerRequested}</div>
          <Chip color={part.status === Review_Status.REVIEWED ? 'success' : 'error'} label={part.status}></Chip>
        </Box>
      );
  }
};

export default PartDisplay;
