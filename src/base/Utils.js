import { URL } from "node:url";
import { s } from "@sapphire/shapeshift";
import graceful from "graceful-fs";

const PATH = (new URL(process.cwd(), import.meta.url).pathname).concat("/");

/**
 * @param {string} path 
 * @param {{ handler: (file: string, index: number) => void, filter: (file: string, index: number, array: string[]) => boolean }} options
 */
export function read(path, options = { handler: () => { }, filter: () => { } }) {
  let { handler, filter } = options;
  s.string.parse(path);

  let results = graceful.readdirSync(PATH.concat(path), { encoding: "utf8" });

  if (typeof filter === "function") results = results.filter(filter);
  if (typeof handler === "function") for (let index = 0; index < results.length; index++) {
    const result = results[index];

    let syncResult = stat(PATH.concat(`${path}/${result}`));

    if (syncResult.isDirectory()) for (let i = 0; i < result.length; i++) handler(PATH.concat(`${result.concat(`/${result[index]}`)}`), i);
    if (syncResult.isFile()) handler(PATH.concat(`${path}/${result}`), index);
  };

  return results;
};

/**
 * @param {string} path 
 * @returns {graceful.Stats}
 */
export function stat(path) {
  s.string.parse(path);

  return graceful.statSync(PATH.concat(path));
};

/**
 * Create new Error.
 * @param {TypeErrorConstructor | RangeErrorConstructor | ErrorConstructor} constructor
 * @param {string} name 
 * @param {string} message
 * @returns {void}
 */
export function error(constructor, name, message) {
  /**
   * @type {TypeError | RangeError | Error}
   */
  const body = new constructor(message);
  body.name = name;

  throw body;
};

/**
 * @param {number} seconds 
 * @returns {Promise} 
 */
export async function delay(seconds = 1) {
  s.number.parse(seconds);

  const promise = new Promise((resolve) => setTimeout(resolve, Math.floor(seconds * 1000)));

  return promise;
};

export default PATH;