/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { ChangeRequestExplanation, StandardChangeRequest } from 'shared';
import PageBlock from '../../layouts/PageBlock';

interface StandardDetailsProps {
  cr: StandardChangeRequest;
}
const style = {
  maxWidth: '140px',
  fontWeight: 'bold'
};
const StandardDetails: React.FC<StandardDetailsProps> = ({ cr }: StandardDetailsProps) => {
  return (
    <PageBlock title={'Standard Change Request Details'}>
      <Grid container spacing={1}>
        <Grid item xs={2}>
          <Typography sx={style}>What</Typography>
        </Grid>
        <Grid item xs={10}>
          <Typography>{cr.what}</Typography>
        </Grid>
        <Grid item xs={2}>
          <Typography sx={style}>Why</Typography>
        </Grid>
        {cr.why.map((ele: ChangeRequestExplanation, idx: number) => [
          idx !== 0 ? <Grid item xs={2}></Grid> : <></>,
          <Grid item xs={2}>
            <Typography sx={style}>{ele.type}</Typography>
          </Grid>,
          <Grid item xs={8}>
            <Typography>{ele.explain}</Typography>
          </Grid>
        ])}
      </Grid>
    </PageBlock>
  );
};

export default StandardDetails;
