import { ILogger } from '@mskg/tabler-world-common';
import { Param_TTLS } from '@mskg/tabler-world-config';
import { KeyValueCache } from 'apollo-server-core';
import { TTLs } from '../cache/TTLs';

export async function cachedLoad<T>(
    { cache, logger }: { cache: KeyValueCache<string>, logger: ILogger },
    key: string,
    resolver: () => Promise<T>,
    ttl: keyof Param_TTLS,
): Promise<T> {
    const cached = await cache.get(key);

    if (cached != null && typeof (cached) === 'string') {
        logger.log('cache hit', key);

        if (cached.startsWith('raw:')) { return cached.substr(4) as unknown as T; }
        return JSON.parse(cached);
    }

    const result = await resolver();
    // console.log("Result", key, result);

    const resultSerialized = typeof (result) === 'string' ? ('raw:' + result) : JSON.stringify(result);
    logger.log(key, 'cache size', resultSerialized.length);

    const ttls = await TTLs();

    cache.set(
        key,
        resultSerialized,
        ttl ? { ttl: ttls[ttl] } : undefined,
    );

    return result;
}
