import {sendDockCommands} from './sendDockCommands.ts';

export const evaluateInDock = async <Result>(expression: string) => {
    const commands = [{
        method: 'Runtime.evaluate',
        params: {expression, awaitPromise: true, returnByValue: true},
    }];

    const {result, exceptionDetails} = await sendDockCommands(commands);

    if (exceptionDetails) {
        throw new Error(`${exceptionDetails.text}: ${result?.description ?? expression}`);
    }

    return result?.value as Result;
};
