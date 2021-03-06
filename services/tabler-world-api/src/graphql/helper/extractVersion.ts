export const LATEST_VESION = '$LATEST';

export function extractVersion(data: { [key: string]: string }): string {
    if (!data || data['x-client-name'] !== 'TABLER.APP') {
        return LATEST_VESION;
    }

    return data['x-client-version'] || LATEST_VESION;
}

export function extractPlatform(data: { [key: string]: string }): 'ios' | 'android' | undefined {
    if (!data || data['x-client-name'] !== 'TABLER.APP') {
        return undefined;
    }

    // @ts-ignore
    return data['x-client-os'];
}
