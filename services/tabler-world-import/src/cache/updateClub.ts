import { xAWS } from '@mskg/tabler-world-aws';
import { makeCacheKey } from '@mskg/tabler-world-cache';
import { enrichAddress } from '@mskg/tabler-world-geo';
import { IDataService } from '@mskg/tabler-world-rds-client';
import { cacheInstance } from './cacheInstance';
import { removeFamily } from './removeFamily';

// we keep an im memory hash of the last updated clubs
// the lambda is short lived, with a max degree of three
// this should prevent (some) duplicate/unnecessary updates
const updated: {
    [key: string]: number,
} = {};

const MINUTES_5 = 5 * 60 /* s */ * 1000 /* ms */;

export async function updateClub(client: IDataService, club: string) {
    const key = makeCacheKey('Club', [club]);

    if (updated[key] != null && Date.now() - updated[key] < MINUTES_5) {
        return;
    }

    const res = await client.query(
        `select * from structure_clubs where id = $1`,
        [club]);

    const newClub = res.rows.length === 1 ? res.rows[0] : undefined;

    updated[key] = Date.now();

    if (newClub != null) {
        console.log('Updating', key);
        cacheInstance.set(key, JSON.stringify(newClub));

        const addresses = [
            newClub.meetingplace1,
            newClub.meetingplace2,
        ].filter((a) => a != null && a !== '');

        if (addresses.length > 0) {
            const sqs = new xAWS.SQS();
            await sqs.sendMessage({
                QueueUrl: process.env.geocode_queue as string,
                MessageBody: JSON.stringify(
                    addresses.map(
                        (address) => enrichAddress(
                            address,
                            removeFamily(newClub.association),
                        ),
                    ),
                ),
            }).promise();
        }

        // member could have been board
        const areaKey = makeCacheKey('Area', [newClub.area]);
        console.log('Removing', areaKey);
        await cacheInstance.delete(areaKey);

        const associationKey = makeCacheKey('Association', [newClub.association]);
        console.log('Removing', associationKey);
        await cacheInstance.delete(associationKey);

        const familyKey = makeCacheKey('Family', [newClub.family]);
        console.log('Removing', familyKey);
        await cacheInstance.delete(familyKey);

        // Read caches
        const allAreas = makeCacheKey('Structure', [newClub.association, 'areas', 'all']);
        console.log('Removing', allAreas);
        await cacheInstance.delete(allAreas);

        const allClubs = makeCacheKey('Structure', [newClub.association, 'clubs', 'all']);
        console.log('Removing', allClubs);
        await cacheInstance.delete(allClubs);

        const allFamilies = makeCacheKey('Structure', ['families', 'all']);
        console.log('Removing', allFamilies);
        await cacheInstance.delete(allFamilies);

        const allAssociations = makeCacheKey('Structure', ['associations', 'all']);
        console.log('Removing', allAssociations);
        await cacheInstance.delete(allAssociations);

    } else {
        console.log('Removing', key);
        cacheInstance.delete(key);
    }
}
