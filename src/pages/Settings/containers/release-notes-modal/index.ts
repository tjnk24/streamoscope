import preload from '__utils/hocs/preload';

import {onDispose, onLoad} from './preload';
import ReleaseNotesModal from './ReleaseNotesModal';

export default preload({onLoad, onDispose})(ReleaseNotesModal);
