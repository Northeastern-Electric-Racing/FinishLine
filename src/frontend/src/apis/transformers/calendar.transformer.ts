import { Shop, User } from 'shared';

const userTransformer = (user: User): User => {
  // Nothing to coerce on User right now
  return {
    ...user,
  };
};

export const shopTransformer = (shop: Shop): Shop => {
  return {
    ...shop,
    dateCreated: new Date(shop.dateCreated),
    userCreated: userTransformer(shop.userCreated),
  };
};