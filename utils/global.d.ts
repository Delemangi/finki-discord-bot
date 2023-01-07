import { type ColorResolvable } from 'discord.js';

declare global {
  type Command = {
    data: {
      name: string;
      toJSON: () => string;
    };
    execute: (interaction: CommandInteraction) => Promise<void>;
  };

  type BotConfig = {
    applicationID: string;
    color: ColorResolvable;
    crosspostChannels: string[];
    keyvDB: string;
    logChannel: string;
    token: string;
  };

  type RoleConfig = {
    activity: string[];
    color: string[];
    course: { [index: string]: string[] };
    courses: { [index: string]: string };
    notification: string[];
    program: string[];
    year: string[];
  };

  type Option = {
    name: string;
    value: string;
  };

  type Question = {
    answer: string;
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
    raspored: string;
    title: string;
  };

  type CourseStaff = {
    assistants: string;
    course: string;
    professors: string;
  };

  type CourseParticipants = {
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
  };

  type Poll = {
    isPublic: boolean;
    optionVotes: number[];
    options: string[];
    owner: string;
    participants: {
      id: string;
      tag: string;
      vote: number;
    }[];
    title: string;
    votes: number;
  };

  type Classroom = {
    capacity: number;
    classroom: number | string;
    floor: number;
    location: string;
    type: string;
  };

  type Information = {
    course: string;
    link: string;
  };
}

export { };
