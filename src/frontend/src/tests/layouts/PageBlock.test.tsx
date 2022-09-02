/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../TestSupport/TestUtils';
import PageBlock from '../../layouts/PageBlock';

const renderComponent = (headerRight = false) => {
  return render(
    <PageBlock title={'test'} headerRight={headerRight ? <p>hi</p> : undefined}>
      hello
    </PageBlock>
  );
};

describe('card component', () => {
  it('renders without error', () => {
    renderComponent();
  });

  it('renders title', () => {
    renderComponent();

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders header right', () => {
    renderComponent(true);

    expect(screen.getByText('hi')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderComponent();

    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
