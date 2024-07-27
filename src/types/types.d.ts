import * as Sapphire from "@sapphire/framework";

declare module "@sapphire/framework" {
  interface Preconditions {
    BannedUser: never;
    MemberValidation: never;
    NoModerator: never;
    F2: never;
    F3: never;
    Helpers: never;
    Marshals: never;
    Stewards: never;
  }
}
