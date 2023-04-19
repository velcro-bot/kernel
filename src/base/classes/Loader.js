import PATH, { read, commands as BASE_COMMANDS, languages as BASE_LANGUAGES, handlers as BASE_HANDLERS, events as BASE_EVENTS } from "../Utils.js";

import { Client, BaseInteraction, Collection } from "discord.js";
import ora from "ora";
import EventEmitter from "eventemitter3";

export class Loader extends EventEmitter {
  /**
   * @param {Client} client
   * @constructor
   */
  constructor(client) {
    super();

    /**
     * @private
     */
    this.client = client;

    /**
     * @type {Array<Collection<string, import("../export.js").Event>>}
     * @readonly
     */
    this.events = [];

    /**
     * @type {Array<Collection<string, import("../export.js").Command>>}
     * @readonly
     */
    this.commands = [];

    /**
     * @type {Array<Collection<string, import("../export.js").Handler>>}
     * @readonly
     */
    this.handlers = [];

    /**
     * @type {Array<{ code: string, source: {} }>}
     * @readonly
     */
    this.languages = [];
  };

  /**
   * Load events and handlers into Loader.
   * @returns {Promise<void>}
   */
  async EventsAndHandlers() {
    const events = read("/**/src/bot/events/**/*.js");

    let spinner = ora("Events Loading").start();

    let total = events.length;
    let loaded = 0;

    for await (const _event of events) {
      await (import(_event)).then((constructor) => {
        /**
         * @type {import("../export.js").Event}
         */
        const event = new (constructor.default)(this.client);

        if (event?.name) {
          if (event.enabled) {
            BASE_EVENTS.set(event.name, event);
            this.events.push(event);

            let Base = (event.mode === "client" ? this.client : process);
            let Once = (event.once ? "once" : "on");

            if (event?.enabled) Base[Once](event.name, (...args) => this._EventAndHandler(event, ...args));

            loaded++;

            this.emit("eventLoaded", event);
          };

          spinner.text = spinner.text.concat(` (${loaded}/${total})`);
        };
      });
    };

    spinner = spinner.render().start("Handlers Loading");

    const handlers = read("/**/src/bot/handlers/**/*.js");

    total = handlers.length;
    loaded = 0;

    for await (const _handler of handlers) {
      await (import(_handler)).then((constructor) => {
        /**
         * @type {import("../export.js").Handler}
         */
        const handler = new (constructor.default)(this.client);

        if (handler?.name) {
          if (handler.enabled) {
            BASE_HANDLERS.set(handler.name, handler);
            this.handlers.push(handler);

            let Base = (handler.mode === "client" ? this.client : process);
            let Once = (handler.once ? "once" : "on");

            Base[Once](handler.name, (...args) => this._EventAndHandler(handler, ...args));

            loaded++;

            this.emit("handlerLoaded", handler);
          };

          spinner.text = spinner.text.concat(` (${loaded}/${total})`);
        };
      });
    };

    spinner.stop();

    return void 0;
  };

  /**
   * Load commands into Loader.
   * @returns {Promise<void>}
   */
  async Commands() {
    const commands = read("/**/src/bot/commands/**/*.js");

    let spinner = ora("Commands Loading").start();

    let total = commands.length;
    let loaded = 0;

    for await (const _command of commands) {
      await (import(_command)).then((constructor) => {
        /**
         * @type {import("../export.js").Command}
         */
        const command = new (constructor.default)(this.client);

        if (command?.name) {
          if (command.enabled) {
            BASE_COMMANDS.set(command.name, command);
            this.commands.push(command.data);

            loaded++;

            this.emit("commandLoaded", command);
          };

          spinner.text = spinner.text.concat(` (${loaded}/${total})`);
        };
      });
    };

    spinner.stop();

    return void 0;
  };

  /**
   * Load languages into Loader.
   * @returns {Promise<void>}
   * @private
   * @deprecated
   */
  async Languages() {
    const languages = read("/**/src/bot/languages/**/*.js");

    let spinner = ora("Languages Loading").start();

    let total = languages.length;
    let loaded = 0;

    for await (const _language of languages) {
      const code = ((_language.split("/")[5]).split(".js")[0]);
      const directCode = (code.split("-")[0]);

      await (import(_language)).then((_source) => {
        const source = _source.default;

        BASE_LANGUAGES.set(directCode, source);
        BASE_LANGUAGES.set(code, source);

        this.languages.push({ code, source });

        loaded++;

        this.emit("languageLoaded", code, source);

        spinner.text = spinner.text.concat(` (${loaded}/${total})`);
      });
    };

    return void 0;
  };

  /**
   * Load all utils.
   * @returns {Promise<void>}
   */
  async All() {
    await this.EventsAndHandlers();
    await this.Commands();
    // await this.Languages(); // this feature will be added in future versions.

    this.emit("ready", true);

    return void 0;
  };

  /**
   * @param {import("../export.js").Event} event
   * @param  {...any} args
   * @private
   */
  _EventAndHandler(event, ...args) {
    const interaction = args[0];

    if (interaction instanceof BaseInteraction) {
      if (event?.type === "Button" && (interaction.isButton())) event.execute(...args);
      else if (event?.type === "ChatCommand" && (interaction.isChatInputCommand())) event.execute(...args);
      else if (event?.type === "ContextCommand" && (interaction.isContextMenuCommand())) event.execute(...args);
      else if (event?.type === "Menu" && (interaction.isMentionableSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu() || interaction.isStringSelectMenu() || interaction.isUserSelectMenu())) event.execute(...args);
      else if (event?.type === "Modal" && (interaction.isModalSubmit())) event.execute(...args);

      else event.execute(...args);
    }

    else event.execute(...args);
  };
};

export default Loader;