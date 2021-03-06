import { BatchWrite, WriteRequest } from '@mskg/tabler-world-aws';
import { ConsoleLogger } from '@mskg/tabler-world-common';
import { dynamodb as client } from '../aws/dynamodb';
import { DIRECT_CHAT_PREFIX } from '../types/Constants';
import { FieldNames, PUSH_SUBSCRIPTIONS_TABLE } from './Constants';

const logger = new ConsoleLogger('PushSubscriptions');

export class PushSubcriptionManager {
    public async subscribe(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'subscribe', conversation, member);

        // this is a one:one conversation, you cannot unsuscribe
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return;
        }

        const items: [string, WriteRequest][] = member.map((m) => ([
            PUSH_SUBSCRIPTIONS_TABLE,
            {
                PutRequest: {
                    Item: {
                        [FieldNames.conversation]: conversation,
                        [FieldNames.member]: m,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Updated', item[0], item[1].PutRequest?.Item[FieldNames.member]);
        }
    }

    public async unsubscribe(conversation: string, member: number[]): Promise<void> {
        logger.log(`[${conversation}]`, 'unsubscribe', member);

        // this is a one:one conversation, you cannot unsubscribe
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            return;
        }

        const items: [string, WriteRequest][] = member.map((m) => ([
            PUSH_SUBSCRIPTIONS_TABLE,
            {
                DeleteRequest: {
                    Key: {
                        [FieldNames.conversation]: conversation,
                        [FieldNames.member]: m,
                    },
                },
            },
        ]));

        for await (const item of new BatchWrite(client, items)) {
            logger.log('Deleted', item[0], item[1].DeleteRequest?.Key[FieldNames.member]);
        }
    }

    public async getSubscribers(conversation: string): Promise<number[]> {
        logger.log(`[${conversation}]`, 'getSubscribers');

        // this is a one:one conversation
        if (conversation.startsWith(DIRECT_CHAT_PREFIX)) {
            const [a, b] = conversation
                .replace(/CONV\(|\)|:/ig, '')
                .split(',');

            return [parseInt(a, 10), parseInt(b, 10)];
        }

        const { Items: members, ConsumedCapacity } = await client.query({
            TableName: PUSH_SUBSCRIPTIONS_TABLE,

            ExpressionAttributeValues: {
                ':conversation': conversation,
            },
            KeyConditionExpression: `${FieldNames.conversation} = :conversation`,
            ProjectionExpression: `${FieldNames.member}`,
        }).promise();

        logger.log(`[${conversation}]`, 'getSubscribers', ConsumedCapacity);
        return members
            ? members.map((m) => m[FieldNames.member] as number).filter((m) => m !== 0)
            : [];
    }
}
