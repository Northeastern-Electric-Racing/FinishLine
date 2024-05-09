import { ProjectProposedChangesPreview, WorkPackageProposedChangesPreview } from 'shared';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import {
  ChangeBullet,
  PotentialChangeType,
  changeBulletDetailText,
  potentialChangeBackgroundMap,
  potentialChangeHighlightMap
} from '../../../utils/diff-page.utils';
import { labelPipe } from '../../../utils/pipes';

interface ProjectDiffPanelProps {
  projectProposedChanges?: ProjectProposedChangesPreview;
  workPackageProposedChanges?: WorkPackageProposedChangesPreview;
  potentialChangeTypeMap: Map<string, PotentialChangeType>;
}

export const DiffPanel: React.FC<ProjectDiffPanelProps> = ({
  projectProposedChanges,
  workPackageProposedChanges,
  potentialChangeTypeMap
}) => {
  const projectChangeBullets: ChangeBullet[] = [];
  for (var projectKey in projectProposedChanges) {
    if (projectProposedChanges.hasOwnProperty(projectKey)) {
      projectChangeBullets.push({
        label: projectKey,
        detail: projectProposedChanges[projectKey as keyof ProjectProposedChangesPreview]!
      });
      potentialChangeTypeMap.set(projectKey, PotentialChangeType.ADDED);
    }
  }

  for (var workPackageKey in workPackageProposedChanges) {
    if (workPackageProposedChanges.hasOwnProperty(workPackageKey)) {
      projectChangeBullets.push({
        label: workPackageKey,
        detail: workPackageProposedChanges[workPackageKey as keyof WorkPackageProposedChangesPreview]!
      });
      potentialChangeTypeMap.set(workPackageKey, PotentialChangeType.ADDED);
    }
  }

  const renderDetailText = (detailText: string | string[]) => {
    if (typeof detailText === 'string') {
      return (
        <Typography padding="3px" display="inline">
          {detailText}
        </Typography>
      );
    } else {
      return (
        <ul style={{ paddingLeft: '23px', marginBottom: '3px', marginTop: '0px' }}>
          {detailText.map((bullet) => (
            <li>{bullet}</li>
          ))}
        </ul>
      );
    }
  };

  return (
    <Box>
      {projectChangeBullets.map((changeBullet) => {
        const detailText = changeBulletDetailText(changeBullet);
        const potentialChangeType = potentialChangeTypeMap.get(changeBullet.label)!;

        return potentialChangeType === PotentialChangeType.SAME ? (
          <Typography>
            {labelPipe(changeBullet.label)}: {renderDetailText(detailText)}
          </Typography>
        ) : (
          <Box
            sx={{ backgroundColor: potentialChangeBackgroundMap.get(potentialChangeType), borderRadius: '5px', mb: '3px' }}
          >
            <Box
              sx={{
                backgroundColor: potentialChangeHighlightMap.get(potentialChangeType),
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
