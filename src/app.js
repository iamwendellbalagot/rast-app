import {initializeValue, DOMnode, initializeEffect} from '../rast';
/** @jsx DOMnode */

import styles from './styles.module.scss'


function App() {
    const input = initializeValue('');
    const logs = initializeValue(['wendel', 'jim', 'als']);

    initializeEffect([logs.value], () => {
        console.log('UPDATING: ',logs.value)
    })

    const handleInput = (e) => {
        e.preventDefault();
        input.value && logs.setValue([...logs.value, input.value])
        input.setValue('')
    }

    const handleDelete = (idx) => { 
        const newLogs = [...logs.value].filter(val => val !== logs.value[idx])
        logs.setValue(newLogs)
    }


    return (
      <div className={styles.app}>
        <h1>Rast</h1>
        <form  eventSubmit={handleInput}>
            <input 
                placeholder='Enter a text..'
                value={input.value}
                eventInput={(e) => input.setValue(e.target.value)}
            />
            <button type='submit'>Add</button>
        </form>
        {logs.value.map((a,idx) => (
            <p className={styles.logs} eventClick={() => handleDelete(idx)}>{a}</p>
        ))}
      </div>
    );
}

export default App;