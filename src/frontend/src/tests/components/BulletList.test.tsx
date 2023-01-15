/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { render, screen } from '@testing-library/react';
import BulletList from '../../components/BulletList';

describe('Bullet List Component', () => {
  it('renders the component title', () => {
    render(<BulletList title={'test'} list={[<></>]} />);

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('renders all bullets', () => {
    render(<BulletList title={'test'} list={[<>one</>, <>two</>]} />);

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('renders ordered list', () => {
    render(<BulletList title={'test'} list={[<>one</>, <>two</>]} ordered />);

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('renders ordered list with header right', () => {
    render(<BulletList title={'te'} headerRight={'hi'} list={['one', 'oh']} ordered />);

    expect(screen.getByText('te')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('oh')).toBeInTheDocument();
    expect(screen.getByText('hi')).toBeInTheDocument();
  });
});
