import { Database } from "./db/Database";
import credentials from "../credentials.json";

export = new Database(credentials.mongodbConnectionURL, credentials.dbName);
