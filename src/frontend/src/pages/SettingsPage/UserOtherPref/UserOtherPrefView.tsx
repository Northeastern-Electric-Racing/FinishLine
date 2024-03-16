/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';

const UserOtherPrefView: React.FC = () => {
  return (
    <Grid container spacing={6} sx={{ pt: '10px' }}>
      <Grid item xs={12} sm={6} md={4} lg={6}>
        <DetailDisplay label="Default Theme" content="--" />
      </Grid>
    </Grid>
  );
};

export default UserOtherPrefView;
