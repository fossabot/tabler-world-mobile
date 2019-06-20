import React from 'react';
import { ApolloProvider } from "react-apollo";
import { Categories, Logger } from '../helper/Logger';
import { bootstrapApollo, getPersistor } from './bootstrapApollo';

const logger = new Logger(Categories.Api);

export function withApollo(App) {
    return class extends React.PureComponent {
        state = {
            client: null,
        }

        async componentDidMount() {
            const client = await bootstrapApollo();

            try {
                await getPersistor().restore();
            }
            catch (e) {
                logger.error(e, "Failed to restore cache");

                try {
                    getPersistor().purge();
                }
                catch { }
            }

            this.setState({ client });
            logger.log("Loaded Apollo.");
        }

        render() {
            const { client } = this.state;

            if (client == null) {
                logger.log("Apollo not loaded yet.");
                return null;
            }

            return (
                <ApolloProvider client={client}>
                    <App />
                </ApolloProvider>
            );
        }
    }
}