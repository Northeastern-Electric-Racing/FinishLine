/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DescriptionBullet } from 'shared';

/*
 * maps a description bullet list to the object needed for forms
 * can't use `id` instead of `bulletId` because react-hook-forms uses id built in for arrays of objects
 */
export const bulletsToObject = (bullets: DescriptionBullet[]) =>
  bullets
    .filter((bullet) => !bullet.dateDeleted)
    .map((bullet) => {
      return { bulletId: bullet.id, detail: bullet.detail };
    });

// transforms the bullets made by react-hook-forms to the objects needed for the payload to the backend
export const mapBulletsToPayload = (ls: { bulletId: number; detail: string }[], excludeId = false) => {
  if (excludeId) {
    return ls.map((ele) => {
      return { detail: ele.detail };
    })
  }
  return ls.map((ele) => {
    return { id: ele.bulletId, detail: ele.detail };
  });
};
