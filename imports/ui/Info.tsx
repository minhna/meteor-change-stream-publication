import { Meteor } from "meteor/meteor";
import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { LinksCollection, Link } from "../api/links/links";

export const Info = () => {
  const { links } = useTracker(() => {
    const sub = Meteor.subscribe("links.all");
    return {
      loading: !sub.ready(),
      links: LinksCollection.find().fetch(),
    };
  });

  const makeLink = (link: Link) => {
    return (
      <li key={link._id}>
        <a href={link.url} target='_blank'>
          {link.title}
        </a>
      </li>
    );
  };

  return (
    <div>
      <h2>Learn Meteor!</h2>
      <ul>{links.map(makeLink)}</ul>
    </div>
  );
};
