import { Collection, Document, ObjectId } from "mongodb";
import { IdQuery } from "../queries/IdQuery.js";

export class BaseRepository {
  collection: Collection;

  constructor(collection: Collection) {
    this.collection = collection;
  }

  async any(filter: object) {
    const result = await this.count(filter);

    return result !== 0;
  }

  async count(filter: object) {
    return this.collection.count(filter);
  }

  async findMany(filter = {}): Promise<Array<Document>> {
    return this.collection.find(filter).toArray();
  }

  async findOne(filter: object): Promise<Document | null> {
    return this.collection.findOne(filter);
  }

  async findById(id: ObjectId): Promise<Document | null> {
    return this.findOne(new IdQuery(id));
  }

  async insertMany(documents: Array<Document>) {
    const result = await this.collection.insertMany(documents);

    return result.acknowledged;
  }

  async insertOne(document: Document) {
    const result = await this.collection.insertOne(document);

    return result.acknowledged;
  }

  async replaceOne(filter: object, document: Document) {
    return this.collection.replaceOne(filter, document, { upsert: true });
  }

  async replaceById(id: ObjectId, document: Document) {
    return this.replaceOne(new IdQuery(id), document);
  }

  async findOneAndReplace(filter: object, document: Document) {
    return this.collection.findOneAndReplace(filter, document, {
      upsert: true,
      returnDocument: "after",
    });
  }

  async findByIdAndReplace(document: Document) {
    return this.findOneAndReplace(new IdQuery(document._id as ObjectId), document);
  }

  async updateMany(filter: object, update: object) {
    return this.collection.updateMany(filter, update);
  }

  async updateOne(filter: object, update: object, upsert = false) {
    return this.collection.updateOne(filter, update, { upsert });
  }

  async updateById(id: ObjectId, update: object, upsert = false) {
    return this.updateOne(new IdQuery(id), update, upsert);
  }

  async findOneAndUpdate(filter: object, update: object, upsert = false) {
    return this.collection.findOneAndUpdate(filter, update, {
      upsert,
      returnDocument: "after",
    });
  }

  async findByIdAndUpdate(id: ObjectId, update: object, upsert = false) {
    return this.findOneAndUpdate(new IdQuery(id), update, upsert);
  }

  async deleteMany(filter: object = {}) {
    return this.collection.deleteMany(filter);
  }

  async deleteOne(filter: object) {
    return this.collection.deleteOne(filter);
  }

  async deleteById(id: ObjectId) {
    return this.deleteOne(new IdQuery(id));
  }

  async findOneAndDelete(filter: object) {
    return this.collection.findOneAndDelete(filter);
  }

  findByIdAndDelete(id: ObjectId) {
    return this.findOneAndDelete(new IdQuery(id));
  }
}
