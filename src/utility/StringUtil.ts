import { Constants } from "./Constants";

export class StringUtil {
  static boldify(str: string) {
    return `**${str.replace(Constants.REGEXES.MARKDOWN, "")}**`;
  }

  static upperFirstChar(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
