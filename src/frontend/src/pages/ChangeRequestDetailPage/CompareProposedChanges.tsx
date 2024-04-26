import { Box, Typography } from '@mui/material';
import { DescriptionBullet } from 'shared';

export interface PotentialChange {
  field: string;
  content: string | DescriptionBullet[];
}

interface CompareProposedChangesProps {
  first: PotentialChange;
  second: PotentialChange;
  isProposed: boolean;
}

const CompareProposedChanges: React.FC<CompareProposedChangesProps> = ({
  first,
  second,
  isProposed
}: CompareProposedChangesProps) => {
  const renderContent = (content: string | DescriptionBullet[]) => {
    if (typeof content === 'string') {
      return (
        <Typography padding="3px" display="inline">
          {content}
        </Typography>
      );
    } else {
      return (
        <ul style={{ paddingLeft: '23px', marginBottom: '3px', marginTop: '0px' }}>
          {content
            .filter((bullet) => !bullet.dateDeleted)
            .map((bullet) => (
              <li key={bullet.id}>{bullet.detail}</li>
            ))}
        </ul>
      );
    }
  };

  const compareArrays = (firstArray: DescriptionBullet[], secondArray: DescriptionBullet[]): boolean => {
    if (firstArray.length !== secondArray.length) return false;
    for (let i = 0; i < firstArray.length; i++) {
      const firstBullet = firstArray[i];
      const secondBullet = secondArray[i];
      if (firstBullet.detail !== secondBullet.detail) {
        return false;
      }
    }
    return true;
  };

  if (
    first.field === second.field &&
    (first.content === second.content ||
      compareArrays(first.content as DescriptionBullet[], second.content as DescriptionBullet[]))
  ) {
    return (
      <Typography>
        {first.field}: {renderContent(first.content)}
      </Typography>
    );
  } else {
    return (
      <Box sx={{ backgroundColor: isProposed ? '#51915c' : '#8a4e4e', borderRadius: '5px', mb: '3px' }}>
        <Box
          sx={{ backgroundColor: isProposed ? '#43a854' : '#ba5050', borderRadius: '5px', width: 'fit-content' }}
          component="span"
          display="inline"
        >
          <Typography fontWeight="bold" padding="3px" display="inline">
            {isProposed ? second.field : first.field}:
          </Typography>
        </Box>
        <Box component="span" display="inline">
          {renderContent(isProposed ? second.content : first.content)}
        </Box>
      </Box>
    );
  }
};

export default CompareProposedChanges;
