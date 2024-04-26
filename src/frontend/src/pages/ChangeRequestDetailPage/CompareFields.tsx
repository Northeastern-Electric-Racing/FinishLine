import { Box, Typography } from '@mui/material';
import { DescriptionBullet } from 'shared';

export interface PotentialChange {
  field: string;
  content: string | DescriptionBullet[];
}

interface CompareFieldsProps {
  first: PotentialChange;
  second: PotentialChange;
  isProposed: boolean;
}

const CompareFields: React.FC<CompareFieldsProps> = ({ first, second, isProposed }: CompareFieldsProps) => {
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

  const compareArrays = (arr1: DescriptionBullet[], arr2: DescriptionBullet[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      const bullet1 = arr1[i];
      const bullet2 = arr2[i];
      if (bullet1.id !== bullet2.id) {
        return false;
      }
    }
    return true;
  };

  const isDescriptionBullet = (input: any): input is DescriptionBullet =>
    typeof input === 'object' &&
    input !== null &&
    typeof input.id === 'string' &&
    typeof input.detail === 'string' &&
    typeof input.dateAdded === 'string' &&
    (typeof input.dateDeleted === 'undefined' || typeof input.dateDeleted === 'string');

  if (first.field === second.field && first.content === second.content) {
    return (
      <Typography>
        {first.field}: {first.content}
      </Typography>
    );
  } else if (isDescriptionBullet(first.content) && isDescriptionBullet(second.content)) {
    const areEqual = compareArrays(first.content as DescriptionBullet[], second.content as DescriptionBullet[]);

    if (areEqual) {
      return (
        <Typography>
          {first.field}: {renderContent(first.content)}
        </Typography>
      );
    } else {
      return (
        <Box sx={{ backgroundColor: '#8a4e4e', borderRadius: '5px', mb: '3px' }}>
          <Box
            sx={{ backgroundColor: '#ba5050', borderRadius: '5px', width: 'fit-content' }}
            component="span"
            display="inline"
          >
            <Typography fontWeight="bold" padding="3px" display="inline">
              {first.field}:
            </Typography>
          </Box>
          <Box component="span" display="inline">
            {renderContent(first.content)}
          </Box>
        </Box>
      );
    }
  } else if (!isProposed) {
    return (
      <Box sx={{ backgroundColor: '#8a4e4e', borderRadius: '5px', mb: '3px' }}>
        <Box
          sx={{ backgroundColor: '#ba5050', borderRadius: '5px', width: 'fit-content' }}
          component="span"
          display="inline"
        >
          <Typography fontWeight="bold" padding="3px" display="inline">
            {first.field}:
          </Typography>
        </Box>
        <Box component="span" display="inline">
          {renderContent(first.content)}
        </Box>
      </Box>
    );
  } else {
    return (
      <Box sx={{ backgroundColor: '#51915c', borderRadius: '5px', mb: '3px' }}>
        <Box
          sx={{ backgroundColor: '#43a854', borderRadius: '5px', width: 'fit-content' }}
          component="span"
          display="inline"
        >
          <Typography fontWeight="bold" padding="3px" display="inline">
            {second.field}:
          </Typography>
        </Box>
        <Box component="span" display="inline">
          {renderContent(second.content)}
        </Box>
      </Box>
    );
  }
};

export default CompareFields;
