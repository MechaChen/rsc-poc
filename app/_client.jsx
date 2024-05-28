import { createRoot } from "react-dom/client";
// fetch stream and convert it to html
import { createFromFetch } from 'react-server-dom-webpack/client';

// HACK: map webpack resolution to native ESM
// @ts-expect-error Property '__webpack_require__' does not exist on type 'Window & typeof globalThis'.
// if browser try to look at the window in order to import the module
// don't do that, just import it straight from the server
window.__webpack_require__ = async (id) => {
    // we can use import in the browser 
    return import(id);
};

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

createFromFetch(fetch('/rsc'))
    .then((component) => {
        root.render(component);
    });
