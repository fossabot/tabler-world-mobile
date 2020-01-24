import { cachedDataLoader, makeCacheKey, writeThrough } from '@mskg/tabler-world-cache';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import DataLoader from 'dataloader';
import { IApolloContext } from '../types/IApolloContext';

// enum RoleNames {
//     President = 'President',
//     VP = 'Vice-President',
//     PP = 'Past-President',

//     IRO = 'I.R.O.',
//     Treasurer = 'Treasurer',

//     PRO = 'P.R.O.',
//     CSO = 'C.S.O.',
//     WEB = 'Webmaster',

//     IT = 'IT Admin',
//     Editor = 'Editor',
//     CDO = 'Corporate Design Officer',

//     Secretary = 'Secretary',
//     Shop = 'Shopkeeper',
// }

// const RoleOrderByMapping = {
//     [RoleNames.President]: 1,
//     [RoleNames.VP]: 2,
//     [RoleNames.PP]: 3,

//     [RoleNames.IRO]: 4,
//     [RoleNames.Treasurer]: 5,

//     [RoleNames.PRO]: 6,
//     [RoleNames.CSO]: 7,
//     [RoleNames.WEB]: 8,

//     [RoleNames.IT]: 9,
//     [RoleNames.Editor]: 10,
//     [RoleNames.CDO]: 11,

//     [RoleNames.Secretary]: 12,
//     [RoleNames.Shop]: 13,
// };

// function sortRoles(roles?: any[]) {
//     if (roles == null || roles.length === 0) return undefined;

//     const sorted = _(roles)
//         .sortBy(r => {
//             const mapped = RoleOrderByMapping[r.role as RoleNames];
//             return mapped || 99
//         })
//         .toArray()
//         .value();

//     return sorted;
// }

export class StructureDataSource extends DataSource<IApolloContext> {
    private context!: IApolloContext;

    private associationLoader!: DataLoader<string, any>;
    private clubLoader!: DataLoader<string, any>;
    private areaLoader!: DataLoader<string, any>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.context = config.context;

        this.associationLoader = new DataLoader<string, any>(
            cachedDataLoader<string>(
                this.context,
                (k) => makeCacheKey('Association', [k]),
                (r) => makeCacheKey('Association', [r.id]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log('DB reading associations', ids);

                        const res = await client.query(`
    select *
    from structure_associations
    where
        id = ANY($1)
    `, [ids]);

                        return res.rows;
                    },
                ),
                'Structure',
            ),
            {
                cacheKeyFn: (k: string) => k,
            },
        );

        this.areaLoader = new DataLoader<string, any>(
            cachedDataLoader<string>(
                this.context,
                (k) => makeCacheKey('Area', [k]),
                (r) => makeCacheKey('Area', [r.id]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log('DB reading areas', ids);

                        const res = await client.query(`
    select *
    from structure_areas
    where
        id = ANY($1)
    `, [ids]);

                        return res.rows;
                    },
                ),
                'Structure',
            ),
            {
                cacheKeyFn: (k: string) => k,
            },
        );

        this.clubLoader = new DataLoader<string, any>(
            cachedDataLoader<string>(
                this.context,
                // we use the same format for the key that can be extracted during read
                (k) => makeCacheKey('Club', [k]),
                (r) => makeCacheKey('Club', [r.id]),
                (ids) => useDataService(
                    this.context,
                    async (client) => {
                        this.context.logger.log('DB reading clubs', ids);

                        const res = await client.query(`
    select *
    from structure_clubs
    where
        id = ANY($1)
    `, [ids]);

                        return res.rows;
                    },
                ),
                'Structure',
            ),
            {
                cacheKeyFn: (k: string) => k,
            },
        );
    }

    public async allClubs(association: string) {
        return await writeThrough(
            this.context,
            makeCacheKey('Structure', [association, 'clubs', 'all']),
            async () => await useDataService(
                this.context,
                async (client) => {
                    this.context.logger.log('DB reading allClubs');

                    const res = await client.query(`
select *
from structure_clubs
where
    association = $1
`, [association]);

                    return res.rows;
                },
            ),
            'StructureOverview',
        );
    }

    public async allAreas(assoc: string) {
        return await writeThrough(
            this.context,
            makeCacheKey('Structure', [assoc, 'areas', 'all']),
            async () => await useDataService(
                this.context,
                async (client) => {
                    this.context.logger.log('DB reading allAreas');

                    const res = await client.query(`
select *
from structure_areas
where
    association = $1
`, [assoc]);

                    return res.rows;
                },
            ),
            'StructureOverview',
        );
    }

    /**
     * Currently this limits the result to only the current organization of the user
     */
    public async allAssociations() {
        return await writeThrough(
            this.context,
            makeCacheKey('Structure', ['associations', 'all']),
            async () => await useDataService(
                this.context,
                async (client) => {
                    this.context.logger.log('DB reading allAssociations');

                    const res = await client.query(`
select *
from structure_associations
`);

                    return res.rows;
                },
            ),
            'StructureOverview',
        );

        // return [await this.getAssociation(this.context.principal.association)];
    }

    public async getAssociation(assoc: string) {
        return this.associationLoader.load(assoc);
    }

    public async getArea(id: string) {
        return this.areaLoader.load(id);
    }

    public async getClub(id: string) {
        return this.clubLoader.load(id);
    }
}
