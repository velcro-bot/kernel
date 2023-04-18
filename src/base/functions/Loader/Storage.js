import { Collection } from "discord.js";

import { s } from "@sapphire/shapeshift";

import Language from "../../classes/Language.js";

const storage = {};

/**
 * Creates new Storage.
 * @param {string} name 
 * @returns {Collection<string, any>}
 */
function Storage(name, overWrite = false) {
  s.string.parse(name);
  s.boolean.parse(overWrite);

  let data = storage[name];

  if (data && !overWrite) return data;
  else if (overWrite && data) storage[name] = new Collection();

  storage[name] = new Collection();
  data = storage[name];
  
  return data;
};

export default Storage;

export const commands = Storage("commands");
export const cooldowns = Storage("cooldowns");
export const events = Storage("events");
export const handlers = Storage("handlers");

const _languages = Storage("languages");
export const languages = new Language(_languages);