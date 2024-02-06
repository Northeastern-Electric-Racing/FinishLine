/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '../test-support/test-utils';
import AppMain from '../../app/AppMain';

vi.mock('../../app/AppPublic', () => {
  return {
    __esModule: true,
    default: () => <div>public</div>
  };
});

vi.mock('../../app/AppContext', () => {
  return {
    __esModule: true,
    default: (props: { children: React.ReactNode }) => (
      <div>
        context
        <div>{props.children}</div>
      </div>
    )
  };
});

// Sets up the component under test with the desired values and renders it
const renderComponent = () => {
  render(<AppMain />);
};

describe('app main, entry component', () => {
  it('renders', () => {
    renderComponent();
    expect(screen.getAllByText('context')[0]).toBeInTheDocument();
    expect(screen.getByText('public')).toBeInTheDocument();
  });
});
