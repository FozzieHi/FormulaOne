import { GuildMember, User } from "discord.js";
import RE2 from "re2";
import { Constants } from "./Constants.js";

export function escape(str: string) {
  return str
    .replace(Constants.GLOBAL_REGEXES.ESCAPED_MARKDOWN, "$1")
    .replace(Constants.GLOBAL_REGEXES.MARKDOWN, "\\$1")
    .replaceAll("\n", "");
}

export function boldify(str: string) {
  return `**${escape(str)}**`;
}

export function unlinkify(str: string) {
  return `\`${escape(str)}\``;
}

export function upperFirstChar(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getOverflowFields(
  titlePrefix: string,
  str: string,
  splitLength = 1000,
) {
  if (str != null) {
    const cleanStr = str
      .replace(Constants.GLOBAL_REGEXES.ZERO_WIDTH, "")
      .replace(new RE2(/\|{10,}/g), ""); // Replace 10 or more consecutive markdown spoiler characters

    const fieldsAndValues = [];
    const count = Math.ceil(cleanStr.length / splitLength);
    for (let i = 0; i < count; i += 1) {
      const start = i * splitLength;
      const end = start + splitLength;

      fieldsAndValues.push(`${titlePrefix}${count > 1 ? ` (${i + 1})` : ""}`); // Only include the segment count if there are multiple segments
      fieldsAndValues.push(
        `${i > 0 ? "..." : ""}${cleanStr.substring(start, end)}${i < count - 1 ? "..." : ""}`, // Add ellipsis to the start and end of each segment if needed
      );
    }
    return fieldsAndValues;
  }
  return [titlePrefix, ""];
}

export function removeClickableLinks(str: string) {
  return str.replace(Constants.GLOBAL_REGEXES.URL, (url) => unlinkify(url));
}

export function getDisplayTag(member: GuildMember) {
  const userTag =
    member.user.discriminator === "0" ? member.user.username : member.user.tag;
  return member.displayName !== member.user.username
    ? `${member.displayName} (${userTag})`
    : userTag;
}

export function getUserTag(user: User) {
  return user.discriminator === "0" ? user.username : user.tag;
}
