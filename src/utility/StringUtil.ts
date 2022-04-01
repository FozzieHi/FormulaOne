import { Constants } from "./Constants";

export class StringUtil {
  static boldify(str: string) {
    return `**${str.replace(Constants.REGEXES.MARKDOWN, "")}**`;
  }
}
