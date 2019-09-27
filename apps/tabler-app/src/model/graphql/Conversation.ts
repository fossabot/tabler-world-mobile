/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Conversation
// ====================================================

export interface Conversation_Conversation_messages_nodes {
  __typename: "ChatMessage";
  id: string;
  eventId: string;
  payload: any | null;
  senderId: number | null;
  receivedAt: any;
  sent: boolean | null;
}

export interface Conversation_Conversation_messages {
  __typename: "ChatMessageIterator";
  nodes: Conversation_Conversation_messages_nodes[];
  nextToken: string | null;
}

export interface Conversation_Conversation {
  __typename: "Conversation";
  messages: Conversation_Conversation_messages;
}

export interface Conversation {
  Conversation: Conversation_Conversation | null;
}

export interface ConversationVariables {
  token?: string | null;
}
