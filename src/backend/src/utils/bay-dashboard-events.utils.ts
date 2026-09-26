import { Response } from 'express';

// by default if a connection is idle for 60s the connection is cut, however TV clients should stay connected.
// keepalive is sent every 25s, which is less than the 60s timeout, so the connection stays open
const KEEPALIVE_MS = 25_000;

// limit the number of clients connected to a single organization
const MAX_CLIENTS_PER_SLUG = 5;

// ensure a save in one org never affects another org's TV, unknown slugs get a stream nobody broadcasts to
const clients = new Map<string, Set<Response>>();

// if a timer is currently running to send keepalive frames to all open streams, or undefined if nobody is listening
let keepAlive: NodeJS.Timeout | undefined;

/**
 * Writes to a stream only if it is still open.
 *
 * @param client the response to write to
 * @param frame the SSE frame to send
 */
const writeIfOpen = (client: Response, frame: string) => {
  if (client.writableEnded || client.destroyed) return;
  client.write(frame);
};

/**
 * Registers an open SSE response against an organization slug.
 *
 * @param slug the organization slug taken from the request URL
 * @param res the response to stream events to
 * @returns false if this slug is already at its connection limit, in which the caller rejects
 *   the request instead of opening a stream
 */
export const addBayDashboardClient = (slug: string, res: Response): boolean => {
  const group = clients.get(slug) ?? new Set<Response>();
  if (group.size >= MAX_CLIENTS_PER_SLUG) return false;

  group.add(res);
  clients.set(slug, group);

  // holds nothing open when nobody is listening
  if (!keepAlive) {
    keepAlive = setInterval(() => {
      for (const listeners of clients.values()) {
        for (const client of listeners) writeIfOpen(client, ': keepalive\n\n');
      }
    }, KEEPALIVE_MS);
  }

  return true;
};

/**
 * Unregisters a closed SSE response.
 * Safe to call for a response that was never registered.
 *
 * @param slug the organization slug the response was registered under
 * @param res the response that closed
 */
export const removeBayDashboardClient = (slug: string, res: Response) => {
  const group = clients.get(slug);
  if (!group) return;

  group.delete(res);
  if (group.size === 0) clients.delete(slug);

  // empty groups are deleted above, so an empty map means nobody is listening to any organization
  if (clients.size === 0 && keepAlive) {
    clearInterval(keepAlive);
    keepAlive = undefined;
  }
};

/**
 * Tells every bay dashboard connected to this organization that something it displays has changed.
 * The event carries no content; the TV refetches over the normal REST endpoints.
 * Always safe to call even if nobody is listening.
 *
 * @param slug the slug of the organization whose dashboard changed
 */
export const broadcastBayDashboardUpdate = (slug: string) => {
  const group = clients.get(slug);
  if (!group) return;
  for (const client of group) writeIfOpen(client, 'event: update\ndata: update\n\n');
};
