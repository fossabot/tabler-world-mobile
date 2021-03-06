import * as Location from 'expo-location';
import { GeoCityLocation } from '../../model/GeoCityLocation';
import { NearbyMembers_nearbyMembers } from '../../model/graphql/NearbyMembers';
import { createAction } from './action';

// tslint:disable-next-line: export-name
export const setLocation = createAction<'@@location/track/setLocation', {
    location?: Location.LocationData,
    address?: GeoCityLocation,
}>(
    '@@location/track/setLocation',
);


export const setNearby = createAction<'@@location/nearby/members', NearbyMembers_nearbyMembers[]>(
    '@@location/nearby/members',
);


export const startWatchNearby = createAction<'@@location/nearby/start'>(
    '@@location/nearby/start',
);

export const stopWatchNearby = createAction<'@@location/nearby/stop'>(
    '@@location/nearby/stop',
);
