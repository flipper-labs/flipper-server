import { gql } from "@urql/core";

export const followingQuery = gql`
  query GetFollowing(
    $limit: LimitScalar
    $cursor: Cursor
    $address: EthereumAddress!
  ) {
    following(request: { limit: $limit, cursor: $cursor, address: $address }) {
      items {
        profile {
          id
          handle
          name
          ownedBy
          picture {
            ... on MediaSet {
              original {
                url
              }
            }
          }
        }
        totalAmountOfTimesFollowing
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;
