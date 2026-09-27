/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box } from '@mui/material';

/**
 * Shared container for a single bay dashboard widget.
 * Used by both the public TV grid and the Admin Tools preview.
 */
const NERWidget: React.FC = ({ children }) => {
  return <Box>{children}</Box>;
};

export default NERWidget;
