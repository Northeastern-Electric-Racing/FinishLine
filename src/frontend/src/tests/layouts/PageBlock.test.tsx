/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../test-support/test-utils';
import PageBlock from '../../layouts/PageBlock';

const renderComponent = (headerRight = false) => {
  return render(
    <PageBlock title={'test'} headerRight={headerRight ? <p>hi</p> : undefined}>
      hello
    </PageBlock>
  );
};

describe('card component', () => {
  it('renders title', () => {
    renderComponent(true);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('hi')).toBeInTheDocument();
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('renders title and headerRight but not children if collapsed', () => {
    renderComponent(true);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it('doesnt render headerRight if none is given', () => {
    renderComponent(false);

    expect(screen.queryByText('hi')).not.toBeInTheDocument();
  });
});
