/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Tooltip, Typography } from '@mui/material';

interface DynamicTooltipProps {
  title: string;
  children: React.ReactElement;
}

const DynamicTooltip: React.FC<DynamicTooltipProps> = ({ title, children }) => {
  return (
    <Tooltip
      id="tooltip"
      placement="right"
      title={<Typography>{title}</Typography>}
      PopperProps={{
        popperOptions: {
          modifiers: [
            {
              name: 'flip',
              options: {
                fallbackPlacements: ['top', 'bottom'],
                padding: -1,
                rootBoundary: 'document'
              }
            },
            {
              name: 'offset',
              options: {
                offset: [0, -1]
              }
            }
          ]
        }
      }}
      arrow
    >
      {children}
    </Tooltip>
  );
};

export default DynamicTooltip;
