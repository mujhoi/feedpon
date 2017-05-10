import React, { PureComponent } from 'react';

import connect from 'utils/react/connect';
import { State } from 'messaging/types';

class KeyboardSettings extends PureComponent<any, any> {
    render() {
        return (
            <div>
                <h1>Keyboard</h1>
            </div>
        );
    }
}

export default connect(
    (state: State) => ({}),
    (dispatch) => ({})
)(KeyboardSettings);
