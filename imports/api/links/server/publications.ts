import { Meteor } from "meteor/meteor";
import { LinksCollection, Link } from "../links";

import type { ChangeEvent } from "mongodb";
import type { Subscription } from "meteor/meteor";

const handleChangeStreamEvents = <TSchema extends { [key: string]: any }>(
  self: Subscription,
  collectionName: string,
  doc: ChangeEvent<TSchema>
) => {
  console.log("changed", doc);
  switch (doc.operationType) {
    case "replace":
      console.log("call changed");
      doc.fullDocument &&
        self.changed(collectionName, doc.documentKey._id, doc.fullDocument);
      break;
    case "insert":
      console.log("call added");
      doc.fullDocument &&
        self.added(collectionName, doc.documentKey._id, doc.fullDocument);
      break;
    case "delete":
      self.removed(collectionName, doc.documentKey._id);
      break;
    case "update":
      const fields: Partial<TSchema> = {};
      doc.updateDescription.removedFields.map((item) => {
        fields[item] = undefined;
      });
      Object.keys(doc.updateDescription.updatedFields).map(
        (item: keyof TSchema) => {
          fields[item] = doc.updateDescription.updatedFields[item];
        }
      );
      self.changed(collectionName, doc.documentKey._id, fields);
      break;
    case "drop":
    case "dropDatabase":
    case "rename":
    case "invalidate":
      self.stop();
      break;
    default:
      break;
  }
};

Meteor.publish("links.all", function () {
  const collectionName = LinksCollection.rawCollection().collectionName;

  const links = LinksCollection.find();
  links.map((link) => {
    this.added(collectionName, link._id, link);
  });

  const changeStream = LinksCollection.rawCollection().watch();
  changeStream.on("change", (doc) => {
    handleChangeStreamEvents<Link>(this, collectionName, doc);
  });

  this.onStop(() => {
    changeStream.close();
  });

  this.ready();
});
