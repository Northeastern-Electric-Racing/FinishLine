/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../../test-support/test-utils';
import PageTitle from '../../../layouts/PageTitle/PageTitle';

jest.mock('../../../layouts/PageTitle/PageBreadcrumbs', () => {
  return {
    __esModule: true,
    default: () => {
      return <div>page-breadcrumbs</div>;
    }
  };
});

describe('error page', () => {
  it('renders title and breadcrumbs', () => {
    render(<PageTitle title={'test'} previousPages={[]} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('page-breadcrumbs')).toBeInTheDocument();
  });
});
