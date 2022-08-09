/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import PageTitle from './page-title';

jest.mock('./page-breadcrumbs/page-breadcrumbs', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>page-breadcrumbs</div>;
    }
  };
});

describe('error page', () => {
  it('renders without error', () => {
    render(<PageTitle title={'test'} previousPages={[]} />);
  });

  it('renders title', () => {
    render(<PageTitle title={'test'} previousPages={[]} />);

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders breadcrumbs', () => {
    render(<PageTitle title={'test'} previousPages={[]} />);

    expect(screen.getByText('page-breadcrumbs')).toBeInTheDocument();
  });
});
