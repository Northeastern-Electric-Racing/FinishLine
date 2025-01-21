import { Prisma } from '@prisma/client';
import { PopUpQueryArgs } from '../prisma-query-args/pop-up.query-args';
import { PopUp } from 'shared';

const popUpTransformer = (popUp: Prisma.PopUpGetPayload<PopUpQueryArgs>): PopUp => {
  return {
    ...popUp,
    eventLink: popUp.eventLink ?? undefined
  };
};

export default popUpTransformer;
