/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { GridAlignment } from '@mui/x-data-grid';

export interface GridColDefStyle {
  flex: number;
  align: GridAlignment;
  headerAlign: GridAlignment;
  headerClassName?: string;
}
