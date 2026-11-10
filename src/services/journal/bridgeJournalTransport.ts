import {connectionSelector} from '__selectors/connectionSelectors';
import {updateSelector} from '__selectors/updateSelectors';
import {getStore} from '__store';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {JournalTransportDto} from '__types/journal';
import {
    JOURNAL_COMMAND_PARAMETER,
    JOURNAL_LINE_SEPARATOR,
    JOURNAL_LINES_PARAMETER,
    JOURNAL_MIN_BRIDGE_VERSION,
} from '__utils/consts';

import {obsConnectionService} from '../obsConnectionService';

class BridgeJournalTransport implements JournalTransportDto {
    isReady = () => {
        const state = getStore();
        const {bridge} = updateSelector(state);

        return connectionSelector(state).status === ConnectionStatusEnum.Identified
            && bridge !== null
            && bridge.bridgeVersion >= JOURNAL_MIN_BRIDGE_VERSION;
    };

    send = (lines: string[]) => {
        obsConnectionService.setProfileParameter(JOURNAL_LINES_PARAMETER, lines.join(JOURNAL_LINE_SEPARATOR));
    };

    setEnabled = (isEnabled: boolean) => {
        this.sendCommand(isEnabled ? 'on' : 'off');
    };

    openFolder = () => {
        this.sendCommand('open');
    };

    private sendCommand = (command: string) => {
        obsConnectionService.setProfileParameter(JOURNAL_COMMAND_PARAMETER, command);
    };
}

export const bridgeJournalTransport = new BridgeJournalTransport();
