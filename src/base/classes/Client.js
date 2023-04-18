import { Client as Base, IntentsBitField as Intents, Partials } from "discord.js";
import logs from "discord-logs";

import { s } from "@sapphire/shapeshift";

import Loader from "../functions/Loader/Loader.js";

import ora from "ora";

import { BitField, enumToObject } from "@sapphire/bitfield";

export class Client extends Base {
  /**
   * @param {string} token
   * @param {import("discord.js").ClientOptions} options
   * @constructor
   */
  constructor(token = process.env["TOKEN"], options) {
    s.string.parse(token);

    super({
      intents: (new BitField(enumToObject(Intents.Flags))).mask,
      partials: Object.values(Partials).filter((partial) => typeof partial === "string"),
      ...options
    });

    logs(this);

    /**
     * @type {string}
     * @readonly
     */
    this.token = token;

    /**
     * @private
     */
    this.loader = Loader(this);
  };

  /**
   * @returns {Promise<void>}
   */
  async login() {
    await this.loader.All(async ({ commands }) => {
      const spinner = ora("Connecting to Gateway").start();

      await super.login(this.token).then(() => {
        this.application.commands.set(commands);

        spinner.succeed("Connected to Gateway.");
      });

      return void 0;
    });

    return void 0;
  };
};

export default Client;

new Client().login();