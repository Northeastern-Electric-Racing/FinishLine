/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid } from '@mui/material';
import DetailDisplay from '../../../components/DetailDisplay';
import ExternalLink from '../../../components/ExternalLink';
import { NERButton } from '../../../components/NERButton';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';

const UserSchedulePrefView: React.FC = () => {
  const [chooseModalShow, setChooseModalShow] = useState<boolean>(false);

  return (
    <Grid container spacing={6} sx={{ pt: '10px' }}>
      <Grid item xs={12} sm={6} md={4} lg={6}>
        <DetailDisplay label="Personal Google Email" content="--" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={6}>
        <DetailDisplay label="Personal Zoom Link" content="--" />
        <ExternalLink
          link="https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0065760#:~:text=Sign%20in%20to%20the%20Zoom,Click%20Copy%20Invitation."
          description="Find your Zoom Id"
          icon={<InfoIcon />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={6}>
        <NERButton
          variant="contained"
          color="success"
          onClick={() => {
            setChooseModalShow(true);
          }}
        >
          View Availability
        </NERButton>
      </Grid>
    </Grid>
  );
};

export default UserSchedulePrefView;
