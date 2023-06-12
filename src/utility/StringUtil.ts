import { GuildMember, User } from "discord.js";
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

export function maxLength(str: string) {
  if (str.length > 200) {
    return `${str.substring(0, 200)}...`;
  }
  return str;
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

export function getDisplayTag(member: GuildMember) {
  const userTag =
    member.user.discriminator === "0" ? member.user.username : member.user.tag;
  if (member.displayName === member.user.username) {
    return userTag;
  }
  return `${member.displayName} (${userTag})`;
}

export function getUserTag(user: User) {
  return user.discriminator === "0" ? user.username : user.tag;
}
