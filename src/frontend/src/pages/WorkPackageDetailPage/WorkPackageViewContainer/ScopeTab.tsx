import { DescriptionBullet, WbsElementStatus, WorkPackage, isGuest } from 'shared';
import CheckList, { CheckListItem } from '../../../components/CheckList';
import { useCurrentUser } from '../../../hooks/users.hooks';

const ScopeTab = ({ workPackage }: { workPackage: WorkPackage }) => {
  const user = useCurrentUser();

  const checkListDisabled = workPackage.status !== WbsElementStatus.Active || isGuest(user.role);

  const descriptoinBulletsSplitByType = new Map<string, DescriptionBullet[]>();
  for (const bullet of workPackage.descriptionBullets) {
    if (bullet.dateDeleted) continue;
    if (!descriptoinBulletsSplitByType.has(bullet.type)) {
      descriptoinBulletsSplitByType.set(bullet.type, []);
    }
    descriptoinBulletsSplitByType.get(bullet.type)!.push(bullet);
  }

  return (
    <>
      {Array.from(descriptoinBulletsSplitByType.entries()).map(([type, bullets]) => (
        <CheckList
          key={type}
          title={type}
          items={bullets.map((db): CheckListItem => {
            return { ...db, resolved: !!db.userChecked, user: db.userChecked };
          })}
          isDisabled={checkListDisabled}
        />
      ))}
    </>
  );
};

export default ScopeTab;
