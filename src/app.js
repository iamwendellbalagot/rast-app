import {initializeValue, DOMnode, initializeEffect} from '../rast';
/** @jsx DOMnode */

import logo from '../assets/logo.png'

import styles from './app.module.scss'


const App = () => {




    return (
      <div className={styles.app}>
            <img src={logo}/>
      </div>
    );
}

export default App;