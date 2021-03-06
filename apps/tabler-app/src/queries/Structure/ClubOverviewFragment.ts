import gql from 'graphql-tag';

export const ClubOverviewFragment = gql`
    fragment ClubOverviewFragment on Club {
        id
        name
        clubnumber
        logo

        area {
            id
            name
            shortname
        }

        association {
            name
            id
            association
        }
    }
`;
