import {
  EmbedBuilder, ActionRowBuilder, ButtonBuilder,
  RoleSelectMenuBuilder, ChannelSelectMenuBuilder, MentionableSelectMenuBuilder,
  UserSelectMenuBuilder, ModalBuilder, TextInputBuilder,
  AttachmentBuilder, SlashCommandBuilder, ContextMenuCommandBuilder,
  StringSelectMenuBuilder,

  EmbedData, ActionRowData, ButtonComponentData, 
  ModalComponentData, TextInputComponentData, BufferResolvable,
  AttachmentData,

  CommandInteraction,

  Client, Collection
} from "discord.js";

import config from "../../../config/config.js";

import API, {
  GuildManager, MessageManager,
  EmojiManager, ChannelManager,
  InviteManager, VoiceManager,
  RoleManager
} from "../../../api/export.js";

import Checker, { isOwner } from "../../functions/Checker.js";

import Command from "./Command.js";
import Event from "./Event.js";
import Handler from "./Handler.js";
import Language from "../../classes/Language.js";

declare abstract class Base {
  public constructor(client: Client);

  private readonly _client: Client;

  public SlashCommand: typeof SlashCommandBuilder;
  public ContextCommand: typeof ContextMenuCommandBuilder;

  public readonly config: typeof config;

  public api: API;
  public guilds: GuildManager;
  public messages: MessageManager;
  public emojis: EmojiManager;
  public channels: ChannelManager;
  public invites: InviteManager;
  public connections: VoiceManager;
  public roles: RoleManager;

  public check: typeof Checker;
  public isOwner: typeof isOwner;

  public client: Client;

  public commands: Collection<string, Command>;
  public events: Collection<string, Event>;
  public handlers: Collection<string, Handler>;
  public languages: Collection<string, Language>;
  public cooldowns: Collection<string, number>;

  public Embed(data?: EmbedData): EmbedBuilder;
  public Row(data?: ActionRowData): ActionRowBuilder;
  public Button(data?: ButtonComponentData): ButtonBuilder;
  public Menu(type: BaseMenuTypes, data?: any): StringSelectMenuBuilder | RoleSelectMenuBuilder | ChannelSelectMenuBuilder | MentionableSelectMenuBuilder | UserSelectMenuBuilder;
  public Modal(data?: ModalComponentData): ModalBuilder;
  public TextInput(data?: TextInputComponentData): TextInputBuilder;
  public Attachment(header: BufferResolvable, data?: AttachmentData): AttachmentBuilder;

  public time(timestamp: number, { format, onlyNumber }: { format?: string, onlyNumber?: boolean }): string | number;
  public code(content: string, language?: string): string;
  public pagination(interaction: CommandInteraction, { embeds, buttons }: { embeds: (EmbedBuilder | EmbedData)[], buttons?: (ButtonBuilder | ButtonComponentData)[] }): Promise<void>;
}

type BaseMenuTypes = "Role" | "Channel" | "Mentionable" | "User" | "String";