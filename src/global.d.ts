import {
  type Awaitable,
  type ChatInputCommandInteraction,
  type ClientEvents,
  type ColorResolvable,
  type ContextMenuCommandBuilder,
  type ContextMenuCommandInteraction,
  type SlashCommandBuilder,
  type SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

declare global {
  type Mode = 'dev' | 'prod';

  type Channels = 'commands' | 'polls' | 'vip';

  type Roles = 'admins' | 'vip';

  type RoleSets =
    | 'activity'
    | 'color'
    | 'courses'
    | 'notification'
    | 'program'
    | 'year';

  type CourseType =
    | 'задолжителен (изб.)'
    | 'задолжителен'
    | 'изборен'
    | 'нема'
    | `задолжителен (${number})`
    | `изборен (${number})`;

  type ProgramKeys = 'ИМБ' | 'КЕ' | 'КИ' | 'КН' | 'ПИТ' | 'СИИС';

  type ProgramValues = 'imb' | 'ke' | 'ki' | 'kn' | 'pit' | 'siis';

  type QuizDifficulties = 'easy' | 'hard' | 'medium';

  type BotConfig = {
    channels?: { [K in Channels]: string };
    color?: ColorResolvable;
    crosspostChannels?: string[];
    ephemeralReplyTime: number;
    guild: string;
    logo: string;
    mode: Mode;
    profiles: { [K in Mode]: { applicationId: string; token: string } };
    roles?: { [K in Roles]: string };
  };

  type RoleConfig = {
    activity: string[];
    color: string[];
    course: { [index: string]: string[] };
    courses: { [index: string]: string };
    level: string[];
    notification: string[];
    other: string[];
    program: string[];
    year: string[];
  };

  type Question = {
    answer: string;
    files?: string[];
    links?: { [index: string]: string };
    question: string;
  };

  type Link = {
    description?: string;
    link: string;
    name: string;
  };

  type Staff = {
    courses: string;
    email: string;
    finki: string;
    konsultacii: string;
    name: string;
    position: string;
    raspored: string;
    title: string;
  };

  type CourseStaff = {
    assistants: string;
    course: string;
    professors: string;
  };

  type CourseParticipants = {
    '2011/2012': number;
    '2012/2013': number;
    '2013/2014': number;
    '2014/2015': number;
    '2015/2016': number;
    '2016/2017': number;
    '2017/2018': number;
    '2018/2019': number;
    '2019/2020': number;
    '2020/2021': number;
    '2021/2022': number;
    '2022/2023': number;
    course: string;
  };

  type CoursePrerequisites = {
    course: string;
    prerequisite: string;
    semester: number;
  } & { [K in ProgramValues]: CourseType };

  type CourseInformation = {
    code: string;
    course: string;
    level: number;
    link: string;
  };

  type Classroom = {
    capacity: number;
    classroom: number | string;
    floor: number;
    location: string;
    type: string;
  };

  type Command = {
    data:
      | ContextMenuCommandBuilder
      | SlashCommandBuilder
      | SlashCommandSubcommandGroupBuilder;
    execute: (
      interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction,
    ) => Promise<void>;
  };

  type CommandResponse = {
    command: string;
    response: string;
  };

  type ClientEvent<K extends keyof ClientEvents> = {
    execute: (...args: ClientEvents[K]) => Awaitable<void>;
    name: K;
    once?: boolean;
  };

  type QuizQuestion = {
    answers: string[];
    correctAnswer: string;
    question: string;
  };

  type QuizQuestions = {
    [index in QuizDifficulties]: QuizQuestion[];
  };
}

export {};
