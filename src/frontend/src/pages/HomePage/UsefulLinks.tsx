/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 *
 */

import { Icon, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import React from 'react';
import { useAllUsefulLinks } from '../../hooks/projects.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

const UsefulLinks: React.FC = () => {
  const theme = useTheme();
  const {
    data: usefulLinks,
    isLoading: usefulLinksIsLoading,
    error: usefulLinksError,
    isError: usefulLinksIsError
  } = useAllUsefulLinks();

  if (!usefulLinks || usefulLinksIsLoading) return <LoadingIndicator />;
  if (usefulLinksIsError) return <ErrorPage message={usefulLinksError.message} />;

  const links = usefulLinks.map((link) => {
    return (
      <>
        <Icon
          sx={{
            fontSize: 22,
            marginRight: 1,
            position: 'relative',
            top: 3,
            color: theme.palette.text.primary
          }}
        >
          {link.linkType.iconName}
        </Icon>
        <Link href={link.url} target="_blank" underline="hover" fontSize={19}>
          {link.linkType.name}
        </Link>
      </>
    );
  });

  // gets the text wrapped in the React element, used here to generate keys
  const rawText = (component: React.ReactElement | string): string => {
    if (!component) {
      return '';
    }
    if (typeof component === 'string') {
      return component;
    }
    const children = component.props && component.props.children;
    if (children instanceof Array) {
      return children.map(rawText).join('');
    }
    return rawText(children);
  };

  return (
    <PageBlock title={'Useful Links'}>
      <Grid container spacing={2}>
        {links.map((ele) => (
          <Grid item xs={6} md={3} key={rawText(ele)}>
            <Typography>{ele}</Typography>
          </Grid>
        ))}
      </Grid>
    </PageBlock>
  );
};

export default UsefulLinks;
