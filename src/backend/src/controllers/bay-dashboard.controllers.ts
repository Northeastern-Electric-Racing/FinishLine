import { Request, Response } from 'express';
import { addBayDashboardClient, removeBayDashboardClient } from '../utils/bay-dashboard-events.utils.js';

export default class BayDashboardController {
  /**
   * Opens a Server-Sent Events stream that emits an empty update event whenever this
   * org's bay dashboard config changes, so the TV can refetch without manually refreshing.
   */
  static streamBayDashboardEvents(req: Request, res: Response) {
    const { slug } = req.params as Record<string, string>;

    if (!addBayDashboardClient(slug, res)) {
      res.status(503).json({ message: 'Too many bay dashboard listeners' });
      return;
    }

    res.status(200).set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    });

    res.flushHeaders();
    res.write(': connected\n\n');

    res.on('close', () => removeBayDashboardClient(slug, res));
  }
}
