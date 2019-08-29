import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { handler as defineHandler } from "./define";
import { handler as createHandler } from "./create";
import { handler as verifyHandler } from "./verify";

export const handler: CognitoUserPoolTriggerHandler = async (event, context, callback) => {
    if (event.triggerSource === "DefineAuthChallenge_Authentication") {
        return await defineHandler(event, context, callback);
    } 

    if (event.triggerSource === "CreateAuthChallenge_Authentication") {
        return await createHandler(event, context, callback);
    }

    if (event.triggerSource === "VerifyAuthChallengeResponse_Authentication") {
        return await verifyHandler(event, context, callback);
    }

    throw new Error(`Unknown source ${event.triggerSource}`);
};