import { initializeValue, DOMnode, initializeEffect } from "rastjs";
/** @jsx DOMnode */
import logo from "../assets/logo.png";
import styles from "./app.module.scss";

const App = () => {
  return (
    <div className={styles.app}>
      <div className={styles.app__nav}>
        <img src={logo} />
        <ul>
          <li>
            <a
              target="_blank"
              href="https://github.com/iamwendellbalagot/rast-app"
            >
              Repository
            </a>
          </li>
          <li>
            <a target="_blank" href="https://github.com/iamwendellbalagot">
              Developer
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.app__body}>
        <h1>RastJS</h1>
        <p>
          A concurrent UI library with fiber data structure for every DOM nodes.
        </p>
      </div>
      <footer>This project is under the MIT License</footer>
    </div>
  );
};

export default App;
