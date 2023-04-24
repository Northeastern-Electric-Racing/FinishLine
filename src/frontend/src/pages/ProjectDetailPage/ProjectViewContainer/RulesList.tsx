/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Typography } from '@mui/material';
import styles from '../../../stylesheets/components/horizontal-list.module.css';

interface RulesListProps {
  rules: string[];
}

const RulesList: React.FC<RulesListProps> = ({ rules }) => {
  return (
    <Box sx={{ marginTop: 2, marginBottom: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography
          variant="h5"
          sx={{
            cursor: 'pointer'
          }}
        >
          {'Rules'}
        </Typography>
      </Box>
      {rules.map((ele, idx) => (
        <div key={idx} className={styles.listItem}>
          {ele}
        </div>
      ))}
    </Box>
  );
};

export default RulesList;
