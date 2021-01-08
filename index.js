import Rast from './rast'
/** @jsx Rast.DOMnode */
import App from './src/app';
const Root = () => {
    return (
        <div>
            <App />
        </div>
    )
}

const element = <Root />;
const container = document.getElementById("root");
Rast.renderDOM(element, container);
