/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ImplementedChange } from 'shared';
import { datePipe, emDashPipe, fullNamePipe, wbsPipe } from '../../utils/pipes';
import { routes } from '../../utils/routes';
import { styled } from '@mui/material/styles';
import { Link, ListItem, List, Tooltip, Typography, TooltipProps, tooltipClasses } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import { useEffect, useLayoutEffect, useState } from 'react';

interface ImplementedChangesListProps {
  changes: ImplementedChange[];
  overallDateImplemented?: Date;
}

const ImplementedChangesList: React.FC<ImplementedChangesListProps> = ({ changes, overallDateImplemented }) => {
  function useWindowSize() {
    const [size, setSize] = useState(0);
    useLayoutEffect(() => {
      function updateSize() {
        setSize(window.innerWidth);
      }
      window.addEventListener('resize', updateSize);
      updateSize();
      return () => window.removeEventListener('resize', updateSize);
    }, []);
    return size;
  }

  const width = useWindowSize();

  // https://mui.com/material-ui/react-tooltip/#VariableWidth.tsx
  const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }}/>
  ))({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: `${width/2}px`,
      overflowWrap: 'break-word',
    },
  });

  return (
    <PageBlock
      title={'Implemented Changes'}
      headerRight={<>{overallDateImplemented ? datePipe(overallDateImplemented) : emDashPipe('')}</>}
    >
      <List>
        {changes.map((ic, idx) => (
          <ListItem key={idx}>
            <CustomWidthTooltip
              id="tooltip"
              title={
                <Typography>
                  {fullNamePipe(ic.implementer)} - {datePipe(ic.dateImplemented)}
                </Typography>
              }
              placement="top"
            >
              <Typography>
                [{<Link href={`${routes.PROJECTS}/${wbsPipe(ic.wbsNum)}`}>{wbsPipe(ic.wbsNum)}</Link>}] {ic.detail}
              </Typography>
            </CustomWidthTooltip>
          </ListItem>
        ))}
      </List>
    </PageBlock>
  );
};

export default ImplementedChangesList;
