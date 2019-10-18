import * as BackgroundFetch from 'expo-background-fetch';
import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { bootstrapApollo, getPersistor } from '../../apollo/bootstrapApollo';
import { isDemoModeEnabled } from '../../helper/demoMode';
import { updateParameters } from '../../helper/parameters/updateParameters';
import { MembersByAreasVariables } from '../../model/graphql/MembersByAreas';
import { GetMembersByAreasQuery } from '../../queries/Member/GetMembersByAreasQuery';
import { GetOfflineMembersQuery } from '../../queries/Member/GetOfflineMembersQuery';
import { GetAreasQuery } from '../../queries/Structure/GetAreasQuery';
import { GetAssociationsQuery } from '../../queries/Structure/GetAssociationsQuery';
import { GetClubsQuery } from '../../queries/Structure/GetClubsQuery';
import { getReduxStore, persistorRehydrated } from '../../redux/getRedux';
import { FETCH_TASKNAME, LOCATION_TASK_NAME } from '../Constants';
import { isSignedIn } from '../isSignedIn';
import { updateLocation } from '../location/updateLocation';
import { logger } from './logger';
import { updateCache } from './updateCache';

export async function runBackgroundFetch() {
    if (await isDemoModeEnabled()) {
        logger.debug('Demonstration mode -> exit');
        return BackgroundFetch.Result.NoData;
    }

    await persistorRehydrated();
    if (!isSignedIn()) {
        logger.debug('Not signed in');
        return BackgroundFetch.Result.NoData;
    }

    const timer = Audit.timer(AuditEventName.BackgroundSync);
    try {
        logger.debug('Running');
        Audit.trackEvent(AuditEventName.BackgroundSync);

        const client = await bootstrapApollo();
        await getPersistor().restore();

        const updateParametersPromise = updateParameters();
        const offlineMembersPromise = updateCache(client, GetOfflineMembersQuery, 'members');

        let locationPromise = Promise.resolve(true);
        if ((await AsyncStorage.getItem(LOCATION_TASK_NAME)) === 'true') {
            // we send a live sign here
            locationPromise = updateLocation(false, true);
        }

        const areas = getReduxStore().getState().filter.member.area;
        const board = getReduxStore().getState().filter.member.showAssociationBoard;
        const areaBoard = getReduxStore().getState().filter.member.showAreaBoard;

        const areaMembersPromise = updateCache(client, GetMembersByAreasQuery, 'members', {
            areaBoard,
            board,
            areas: areas != null ? _(areas)
                .keys()
                .filter((k) => k !== 'length')
                .map((a) => a.replace(/[^\d]/g, ''))
                .map((a) => parseInt(a, 10))
                .value()
                : null,
        } as MembersByAreasVariables);

        const clubsPromise = updateCache(client, GetClubsQuery, 'clubs');
        const areasPromise = updateCache(client, GetAreasQuery, 'areas');
        const associationsPromise = updateCache(client, GetAssociationsQuery, 'associations');

        await Promise.all([
            updateParametersPromise,
            offlineMembersPromise,
            areaMembersPromise,
            clubsPromise,
            areasPromise,
            associationsPromise,
            locationPromise,
        ]);

        await getPersistor().persist();

        const result = BackgroundFetch.Result.NewData;
        logger.debug('done', result);

        timer.submit({ [AuditPropertyNames.BackgroundFetchResult]: result.toString() });
        return result;
    } catch (error) {
        try { await getPersistor().persist(); } catch (pe) {
            logger.error(pe, 'Could not persist');
        }

        logger.error(error, FETCH_TASKNAME);
        timer.submit({ [AuditPropertyNames.BackgroundFetchResult]: BackgroundFetch.Result.Failed.toString() });
        return BackgroundFetch.Result.Failed;
    }
}
