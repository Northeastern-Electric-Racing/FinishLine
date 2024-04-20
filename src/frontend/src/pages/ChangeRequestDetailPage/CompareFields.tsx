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

interface BulletListProps {
  bullets?: DescriptionBullet[]; // Make bullets optional
}

export const BulletList: React.FC<BulletListProps> = ({ bullets }) => {
  if (!bullets) return null; // Return null if bullets is undefined

  return (
    <ul style={{ paddingLeft: '25px', marginBottom: '0.5em' }}>
      {bullets
        .filter((bullet) => !bullet.dateDeleted)
        .map((bullet, idx) => (
          <li key={idx}>{bullet.detail}</li>
        ))}
    </ul>
  );
};

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
        <ul style={{ paddingLeft: '23px', marginBottom: '3px' }}>
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
      if (
        bullet1.id !== bullet2.id ||
        bullet1.detail !== bullet2.detail ||
        bullet1.dateAdded !== bullet2.dateAdded ||
        bullet1.dateDeleted !== bullet2.dateDeleted ||
        bullet1.dateChecked !== bullet2.dateChecked ||
        bullet1.userChecked !== bullet2.userChecked
      ) {
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
        {first.field}: {first.content}
      </Typography>
    );
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
