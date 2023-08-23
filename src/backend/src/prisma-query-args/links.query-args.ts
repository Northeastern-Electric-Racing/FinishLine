import { Prisma } from '@prisma/client';
import linkTypeQueryArgs from './link-types.query-args';

const linkQueryArgs = Prisma.validator<Prisma.LinkArgs>()({
  include: { linkType: { ...linkTypeQueryArgs }, creator: true }
});

export default linkQueryArgs;
