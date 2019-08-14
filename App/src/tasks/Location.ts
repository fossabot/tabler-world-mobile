import * as Location from 'expo-location';
import { LocationData } from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import _ from 'lodash';
import { AsyncStorage } from 'react-native';
import { bootstrapApollo } from '../apollo/bootstrapApollo';
import { Categories, Logger } from '../helper/Logger';
import { PutLocation, PutLocationVariables } from '../model/graphql/PutLocation';
import { PutLocationMutation } from '../queries/PutLocation';
import { setLocation } from '../redux/actions/location';
import { getReduxStore } from '../redux/getRedux';
import { LOCATION_TASK_NAME } from './Const';

const logger = new Logger(Categories.Sagas.Location);

export async function startLocationTask() {
    const enabled = await Location.hasServicesEnabledAsync();
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (enabled) {
        if (started) {
            logger.log(LOCATION_TASK_NAME, "already started");
        } else {
            try {
                logger.log("Starting task", LOCATION_TASK_NAME);

                await Location.requestPermissionsAsync();

                await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
                    accuracy: Location.Accuracy.Low,

                    // time
                    timeInterval: 15*60*1000,
                    distanceInterval: 1000,

                    mayShowUserSettingsDialog: false,
                    pausesUpdatesAutomatically: true,
                });

                const location = await Location.getCurrentPositionAsync();
                handleLocation([location]);
            } catch (e) {
                logger.error(e, `Start of ${LOCATION_TASK_NAME} failed`);
            }
        }
    } else {
        logger.log("*********** LOCATION SERVICES DISABLED ***********");
    }
}

async function handleLocation(locations: LocationData[]) {
    logger.log(locations);

    const location = _(locations).maxBy(l => l.timestamp) as LocationData;
    const address = await Location.reverseGeocodeAsync(
        location.coords
    );

    logger.log("Geocoding", address);
    getReduxStore().dispatch(setLocation({
        location: location[0],
        address: address[0],
    }));

    const client = await bootstrapApollo();
    await client.mutate<PutLocation, PutLocationVariables>({
        mutation: PutLocationMutation,
        variables: {
            location: {
                longitude: location.coords.longitude,
                latitude: location.coords.latitude,
                accuracy: location.coords.accuracy,
                speed: location.coords.speed,
                address,
            },
        }
    });
}

export async function registerLocationTask() {
    try {
        TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
            if (error) {
                logger.error(error);
                return;
            }

            if (data) {
                // do something with the locations captured in the background
                const locations: LocationData[] = (data as any).locations;
                await handleLocation(locations);
            }
        });

        if (await AsyncStorage.getItem(LOCATION_TASK_NAME) === "true") {
            await startLocationTask();
        } else {
            logger.log("*********** nearbyMembers DISABLED ***********");
        }
    } catch (e) {
        logger.error(e, "Registering of tasks failed");
    }
}