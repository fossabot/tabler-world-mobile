
type CacheTypes =
    | 'Members'
    | 'Member'

    | 'Structure'

    | 'Club'
    | 'Area'
    | 'Association'

    | 'Family'

    | 'Resource'
    | 'Principal'
    ;

export function makeCacheKey(type: CacheTypes, ids: (string | number)[]) {
    return `tw::${type}::${ids.join(':')}`;
}
