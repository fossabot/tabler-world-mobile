import gql from 'graphql-tag';
import { MemberOverviewFragment } from '../Member/MemberOverviewFragment';

export const GetNearbyMembersQuery = gql`
    query NearbyMembers($location: MyCurrentLocationInput!, $hideOwnTable: Boolean!) {
        nearbyMembers(location: $location, query: { excludeOwnTable: $hideOwnTable}) @connection(key: "nearbyMembers") {
            member {
                ...MemberOverviewFragment
                availableForChat
            }

            lastseen
            state
            distance

            location {
                longitude
                latitude
            }

            locationName {
                name
                country
            }
        }
  }

  ${MemberOverviewFragment}
`;
