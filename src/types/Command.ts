import { type ContextMenuCommand } from './ContextMenuCommand.js';
import { type SlashCommand } from './SlashCommand.js';

export type Command = ContextMenuCommand | SlashCommand;
