import Rast from './rast'
/** @jsx Rast.DOMnode */
import Welcome from './src/app';
const App = () => {
    return (
        <div style='margin:0'>
            <Welcome />
        </div>
    )
}

const element = <App />;
const container = document.getElementById("root");
Rast.renderDOM(element, container);
