import { z } from 'zod';

import { getChatbotUrl } from '../../configuration/environment.js';
import {
  type CreateLink,
  CreateLinkSchema,
  LinkSchema,
  LinksSchema,
  type UpdateLink,
} from '../../lib/schemas/Link.js';
import { logger } from '../../logger.js';
import { databaseErrorFunctions } from '../../translations/database.js';

export const getLinks = async () => {
  const chatbotUrl = getChatbotUrl();

  if (chatbotUrl === null) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/list`);

    if (!result.ok) {
      return null;
    }

    return LinksSchema.parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.getLinksError(error));

    return null;
  }
};

export const getLinkNames = async () => {
  const chatbotUrl = getChatbotUrl();

  if (chatbotUrl === null) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/names`);

    if (!result.ok) {
      return null;
    }

    return z.array(z.string()).parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.getLinkNamesError(error));

    return null;
  }
};

export const getLink = async (name?: string) => {
  const chatbotUrl = getChatbotUrl();

  if (chatbotUrl === null) {
    return null;
  }

  if (name === undefined) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/name/${name}`);

    if (!result.ok) {
      return null;
    }

    return LinkSchema.parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.getLinkError(error));

    return null;
  }
};

export const createLink = async (link?: CreateLink) => {
  const chatbotUrl = getChatbotUrl();

  if (chatbotUrl === null) {
    return null;
  }

  if (link === undefined) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/create`, {
      body: JSON.stringify(CreateLinkSchema.parse(link)),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.ok) {
      return null;
    }

    return LinkSchema.parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.createLinkError(error));

    return null;
  }
};

export const updateLink = async (name?: string, link?: UpdateLink) => {
  const chatbotUrl = getChatbotUrl();

  if (chatbotUrl === null) {
    return null;
  }

  if (name === undefined || link === undefined) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/update/${name}`, {
      body: JSON.stringify(link),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.ok) {
      return null;
    }

    return LinkSchema.parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.updateLinkError(error));

    return null;
  }
};

export const deleteLink = async (name?: string) => {
  const chatbotUrl = getChatbotUrl();

  if (chatbotUrl === null) {
    return null;
  }

  if (name === undefined) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/delete/${name}`, {
      method: 'DELETE',
    });

    if (!result.ok) {
      return null;
    }

    return LinkSchema.parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.deleteLinkError(error));

    return null;
  }
};

export const getNthLink = async (index?: number) => {
  const chatbotUrl = getChatbotUrl();

  if (index === undefined) {
    return null;
  }

  try {
    const result = await fetch(`${chatbotUrl}/links/index/${index}`);

    if (!result.ok) {
      return null;
    }

    return LinkSchema.parse(await result.json());
  } catch (error) {
    logger.error(databaseErrorFunctions.getNthLinkError(error));

    return null;
  }
};
