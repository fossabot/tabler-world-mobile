import * as FileSystem from 'expo-file-system';
import { CacheGroup } from './CacheGroup';
import { DownloadOptions } from './DownloadOptions';
import { getCacheEntry } from './getCacheEntry';
import { logger } from './logger';

export class CacheEntry {
    constructor(private uri: string, private options: DownloadOptions, private group: CacheGroup) {
    }

    async getPath(): Promise<string | undefined> {
        const { uri, options } = this;
        const { path, exists, tmpPath } = await getCacheEntry(uri, this.group);

        if (exists) {
            if (false && __DEV__) {
                return new Promise(
                    (resolve) => setTimeout(
                        () => resolve(path), 4000),
                );
            }

            return path;
        }

        try {
            logger.debug('Downloading', uri, 'to', tmpPath);
            const result = await FileSystem.createDownloadResumable(
                encodeURI(uri),
                tmpPath, options).downloadAsync();

            // If the image download failed, we don't cache anything
            if (result && result.status !== 200) {
                logger.log('Failed to download uri', uri, result.status);

                try {
                    await FileSystem.deleteAsync(tmpPath);
                    await FileSystem.deleteAsync(path);
                } catch { }
                return undefined;
            }
        } catch (e) {
            logger.log('Failed to download uri', uri, e);
            return undefined;
        }

        await FileSystem.moveAsync({ from: tmpPath, to: path });
        return path;
    }
}