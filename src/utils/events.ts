import { readdirSync } from 'node:fs';

import { client } from '../client.js';
import { ClientEventSchema } from '../lib/schemas/ClientEvent.js';

export const attachEventListeners = async () => {
  const eventFiles = readdirSync('./dist/events').filter((file) =>
    file.endsWith('.js'),
  );

  for (const file of eventFiles) {
    const rawEvent: unknown = await import(`../events/${file}`);
    const event = ClientEventSchema.parse(rawEvent);

    if (event.once) {
      client.once(event.name, event.execute);
    } else {
      client.on(event.name, event.execute);
    }
  }
};
