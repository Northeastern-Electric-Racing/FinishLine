import { Request, Response } from 'express';
import crypto from 'crypto';
import slackServices from '../services/slack.services';

export default class slackController {
  static async handleEvent(req: Request, res: Response) {
    console.log('got a slack req');
    /*
    if (req.body.type === 'url_verification') {
      res.status(200).send({ challenge: req.body.challenge });
    }
    */
    res.status(200).send({ challenge: req.body.challenge });

    /*
    const slackSignature = req.headers['x-slack-signature'] as string;
    const slackTimeStamp = req.headers['X-Slack-Request-Timestamp'] as string;

    if (Math.abs(Date.now() - Number(slackTimeStamp) * 1000) > 60 * 5 * 1000) {
      res.status(400).send('Slack request verification failed due to expired timestamp');
    }

    const reqBody = req.body;

    const signatureBase = 'v0:' + slackTimeStamp + ':' + reqBody;

    const finalSignature =
      'v0=' + crypto.createHmac('sha256', '124ce6afb575881aa36952d6abd4af0b').update(signatureBase).digest('hex');

    if (
      crypto.timingSafeEqual(
        Uint8Array.from(Buffer.from(finalSignature, 'utf8')),
        Uint8Array.from(Buffer.from(slackSignature, 'utf8'))
      )
    ) {
      slackServices.processEvent(reqBody);
      res.status(200).send('Event recieved');
    }

    res.status(400).send('Slack request verification failed due to incorrect signature');
    */
  }
}
