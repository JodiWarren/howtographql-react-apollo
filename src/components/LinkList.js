import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import Link from "./Link";

class LinkList extends Component {
  componentDidMount() {
    this._subscribeToNewLinks();
    this._subscribeToNewVotes();
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    // 1
    const data = store.readQuery({ query: FEED_QUERY });

    // 2
    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    // 3
    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewVotes = () => {
    this.props.feedQuery.subscribeToMore({
      document: VOTE_SUBSCRIPTION
    });
  };

  _subscribeToNewLinks = () => {
    this.props.feedQuery.subscribeToMore({
      document: FEED_SUBSCRIPTION,
      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [
          subscriptionData.data.newLink.node,
          ...previous.feed.links
        ];
        return {
          ...previous,
          feed: {
            ...previous.feed,
            count: previous.feed.count + 1,
            links: newAllLinks
          }
        };
      }
    });
  };

  render() {
    // 1
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>;
    }

    // 2
    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>;
    }

    // 3
    const linksToRender = this.props.feedQuery.feed.links;

    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link
            key={link.id}
            updateStoreAfterVote={this._updateCacheAfterVote}
            index={index}
            link={link}
          />
        ))}
      </div>
    );
  }
}

const FEED_SUBSCRIPTION = gql`
  subscription {
    newLink {
      node {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

const VOTE_SUBSCRIPTION = gql`
  subscription {
    newVote {
      node {
        id
        link {
          id
          url
          description
          createdAt
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
        user {
          id
        }
      }
    }
  }
`;

// 1
export const FEED_QUERY = gql`
  # 2
  query FeedQuery {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

// 3
export default graphql(FEED_QUERY, { name: "feedQuery" })(LinkList);
