import * as React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './app';
import './index.css';

const root = window.document.createElement('div');
root.id = 'root';
window.document.body.appendChild(root);

const render = Component => {
    ReactDOM.render(
        <React.unstable_ConcurrentMode>
            <AppContainer>
                <Component />
            </AppContainer>
        </React.unstable_ConcurrentMode>,
        root
    );
};

render(App);

/**
 * Re-render for hot module replacement in development.
 */

if (module.hot) {
    module.hot.accept('./app', () => render(App));
}
