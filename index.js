import {renderDOM, createElement} from './Raku'
/** @jsx createElement */
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
renderDOM(element, container);
