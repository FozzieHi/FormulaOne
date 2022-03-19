import { ObjectId } from "mongodb";

export class IdQuery {
  _id: ObjectId;

  constructor(id: ObjectId) {
    this._id = id;
  }
}
