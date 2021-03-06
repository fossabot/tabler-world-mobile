import faker from 'faker';
import { randomLocation } from './randomLocation';

export const Address = () => ({
    street1: () => faker.address.streetAddress(false),
    street2: () => faker.address.secondaryAddress(),
    postal_code: () => faker.address.zipCode(),
    city: () => faker.address.city(),
    country: () => faker.address.countryCode(),
    location: randomLocation,
});

