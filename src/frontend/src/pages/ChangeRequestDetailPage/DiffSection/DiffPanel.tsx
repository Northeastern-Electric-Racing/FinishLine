import { ProjectProposedChangesPreview, WorkPackageProposedChangesPreview, calculateEndDate } from 'shared';
import { Box } from '@mui/system';
import { Link, List, ListItem, Typography, useTheme } from '@mui/material';
import {
  ChangeBullet,
  PotentialChangeType,
  changeBulletDetailText,
  getPotentialChangeBackground
} from '../../../utils/diff-page.utils';
import { labelPipe } from '../../../utils/pipes';

interface ProjectDiffPanelProps {
  projectProposedChanges?: ProjectProposedChangesPreview;
  workPackageProposedChanges?: WorkPackageProposedChangesPreview;
  potentialChangeTypeMap: Map<string, PotentialChangeType>;
}

const DiffPanel: React.FC<ProjectDiffPanelProps> = ({
  projectProposedChanges,
  workPackageProposedChanges,
  potentialChangeTypeMap
}) => {
  const theme = useTheme();

  const changeBullets: ChangeBullet[] = [];
  for (const projectKey in projectProposedChanges) {
    if (projectProposedChanges.hasOwnProperty(projectKey)) {
      changeBullets.push({
        label: projectKey,
        detail: projectProposedChanges[projectKey as keyof ProjectProposedChangesPreview]!
      });
    }
  }

  for (let workPackageKey in workPackageProposedChanges) {
    if (workPackageProposedChanges.hasOwnProperty(workPackageKey)) {
      if (workPackageKey === 'duration') {
        workPackageKey = 'endDate';

        const startDate = new Date(
          new Date(workPackageProposedChanges!.startDate).getTime() -
            new Date(workPackageProposedChanges!.startDate).getTimezoneOffset() * -6000
        );

        const { duration } = workPackageProposedChanges;
        const endDate = calculateEndDate(startDate, duration);
        changeBullets.push({
          label: 'endDate',
          detail: endDate
        });
      } else {
        changeBullets.push({
          label: workPackageKey,
          detail: workPackageProposedChanges[workPackageKey as keyof WorkPackageProposedChangesPreview]!
        });
      }
    }
  }

  const renderDetailText = (detailText: string | string[]) => {
    if (typeof detailText === 'string') {
      return (
        <Typography padding="3px" display="inline">
          {detailText}
        </Typography>
      );
    }
    return (
      <List sx={{ listStyleType: 'disc', pl: 4 }}>
        {detailText.map((bullet) => {
          const url = bullet.includes('http') ? bullet.split(': ')[1] : undefined;
          return (
            <ListItem sx={{ display: 'list-item' }}>
              {url ? (
                <>
                  {bullet.split(': ')[0]}:{' '}
                  <Link color={'#ffff'} href={url}>
                    {bullet.split(': ')[1]}
                  </Link>
                </>
              ) : (
                bullet
              )}
            </ListItem>
          );
        })}
      </List>
    );
  };

  return (
    <Box>
      {changeBullets.map((changeBullet) => {
        const detailText = changeBulletDetailText(changeBullet);
        const potentialChangeType = potentialChangeTypeMap.get(changeBullet.label)!;

        return potentialChangeType === PotentialChangeType.SAME ? (
          <Typography>
            {labelPipe(changeBullet.label)}: {renderDetailText(detailText)}
          </Typography>
        ) : (
          <Box
            sx={{
              backgroundColor: getPotentialChangeBackground(potentialChangeType, theme),
              borderRadius: '5px',
              mb: '3px'
            }}
          >
            <Box
              sx={{
                borderRadius: '5px',
                width: 'fit-content'
              }}
              component="span"
              display="inline"
            >
              <Typography fontWeight="bold" padding="3px" display="inline">
                {labelPipe(changeBullet.label)}:
              </Typography>
            </Box>
            <Box component="span" display="inline">
              {renderDetailText(detailText)}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default DiffPanel;
