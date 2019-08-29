import { gql } from "apollo-server-lambda";

export const Query = gql`
    enum UserRole {
        jobs
    }

    type Query {
        Me: Member!
        MyRoles: [UserRole!]
    }
`;