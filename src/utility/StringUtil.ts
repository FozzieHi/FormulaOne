import { Constants } from "./Constants";

export class StringUtil {
  static boldify(str: string) {
    return `**${str.replace(Constants.GLOBAL_REGEXES.MARKDOWN, "")}**`;
  }

  static unlinkify(str: string) {
    return `\`${str.replace(Constants.GLOBAL_REGEXES.MARKDOWN, "")}\``;
  }

  static upperFirstChar(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static removeClickableLinks(str: string) {
    const pattern = Constants.GLOBAL_REGEXES.URL;
    const urls = str.match(pattern);
    let returnVal = "";
    if (urls) {
      urls.forEach((url) => {
        returnVal = str.replace(url, this.unlinkify(url));
      });
    }
    return returnVal;
  }
}
