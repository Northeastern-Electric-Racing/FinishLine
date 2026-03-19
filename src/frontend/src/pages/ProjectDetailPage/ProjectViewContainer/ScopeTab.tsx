/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet, Project } from 'shared';
import { Typography } from '@mui/material';

export const ScopeTab = ({ project }: { project: Project }) => {
  const descriptoinBulletsSplitByType = new Map<string, DescriptionBullet[]>();
  for (const bullet of project.descriptionBullets) {
    if (bullet.dateDeleted) continue;
    if (!descriptoinBulletsSplitByType.has(bullet.type)) {
      descriptoinBulletsSplitByType.set(bullet.type, []);
    }
    descriptoinBulletsSplitByType.get(bullet.type)!.push(bullet);
  }

  return (
    <>
      {Array.from(descriptoinBulletsSplitByType.entries()).map(([type, bullets]) => (
        <>
          <Typography key={type} variant="h6" gutterBottom>
            {type}
          </Typography>
          <ul key={type}>
            {bullets.map((db) => (
              <li key={db.id}>{db.detail}</li>
            ))}
          </ul>
        </>
      ))}
    </>
  );
};
