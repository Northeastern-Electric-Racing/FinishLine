import { Box } from '@mui/system';
import { List, ListItem, Typography, useTheme } from '@mui/material';
import { ComparableObject, PotentialChangeType, getPotentialChangeBackground } from '../../../utils/diff-page.utils';
import { labelPipe } from '../../../utils/pipes';

interface ProjectDiffPanelProps {
  comparableObjects: {
    label: string;
    objects: ComparableObject[];
  }[];
  original?: boolean;
}

const DiffPanel: React.FC<ProjectDiffPanelProps> = ({ comparableObjects, original }) => {
  const theme = useTheme();

  const renderDetailText = (detail: string | ComparableObject[]) => {
    if (typeof detail === 'string' || detail instanceof String) {
      return (
        <Typography padding="3px" display="inline">
          {detail}
        </Typography>
      );
    } else if (Array.isArray(detail) && detail.length > 0) {
      return (
        <List sx={{ listStyleType: 'disc', pl: 6, pb: 1, pt: 0 }}>
          {detail.map((bullet) => {
            return <ListItem sx={{ display: 'list-item', py: 0 }}>{renderDetailText(bullet.value)}</ListItem>;
          })}
        </List>
      );
    }
    return (
      <Typography color="#ffff" display={'inline'} padding={'3px'}>
        No Values
      </Typography>
    );
  };

  return (
    <Box sx={{ padding: '8px' }}>
      {comparableObjects.map((changeSection) => {
        return (
          <>
            <Typography>{changeSection.label}</Typography>
            <List>
              {changeSection.objects.map((changeBullet) => {
                return (
                  <ListItem>
                    {!changeBullet.changed ? (
                      <Typography>
                        <Box pl={2}>
                          {labelPipe(changeBullet.key)}: {renderDetailText(changeBullet.value)}
                        </Box>
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          backgroundColor: getPotentialChangeBackground(
                            original ? PotentialChangeType.REMOVED : PotentialChangeType.ADDED,
                            theme
                          ),
                          borderRadius: '5px',
                          mb: '3px'
                        }}
                      >
                        <Box
                          sx={{
                            borderRadius: '5px',
                            width: 'fit-content'
                          }}
                          pl={2}
                          component="span"
                          display="inline"
                        >
                          <Typography fontWeight="bold" padding="3px" display="inline">
                            {labelPipe(changeBullet.key)}:
                          </Typography>
                        </Box>
                        <Box component="span" display="inline">
                          {renderDetailText(changeBullet.value)}
                        </Box>
                      </Box>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </>
        );
      })}
    </Box>
  );
};

export default DiffPanel;
