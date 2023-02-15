/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet } from 'shared';
import BulletList from './BulletList';

interface DescriptionListProps {
  title: string;
  items: DescriptionBullet[];
}

const DescriptionList = ({ title, items }: DescriptionListProps) => {
  return (
    <BulletList
      title={title}
      list={items.map((b) => (
        <>{b.detail}</>
      ))}
    />
  );
};

export default DescriptionList;
