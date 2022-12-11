import { Constants } from "./Constants.js";

export function boldify(str: string) {
  return `**${str.replace(Constants.GLOBAL_REGEXES.MARKDOWN, "")}**`;
}

export function unlinkify(str: string) {
  return `\`${str.replace(Constants.GLOBAL_REGEXES.MARKDOWN, "")}\``;
}

export function upperFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeClickableLinks(str: string) {
  const pattern = Constants.GLOBAL_REGEXES.URL;
  const urls = str.match(pattern);
  let returnVal = str;
  if (urls != null) {
    urls.forEach((url) => {
      returnVal = returnVal.replace(url, unlinkify(url));
    });
  }
  return returnVal;
}
