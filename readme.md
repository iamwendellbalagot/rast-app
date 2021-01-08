<table align="center"><tr><td align="center" width="9999">
<img src="https://drive.google.com/uc?export=view&id=1kybX7EAbhNyDJN03ORD82tpvThHwJch5" height="150" align='center' />

# RastJS
JavaScript front-end library that supports concurrent mode
</td></tr></table>

  * **RastJS provides a Virtual DOM** abstraction on top of the actual DOM and it's fast, thanks to a simple and predictable reconcile algorithm implementation.
  * Like react, when a component's state data changes, the rendered elements in the **DOM will be updated**.
  
### Installation

``` js
npm install -g rastjs-app
```
* **Note**: *rastjs-app* When you generate a rasp-app, rastjs core library is already intalled it also includes webpack and babel (Like create-react-app).<br/>

Here is the link to core library repository: https://github.com/iamwendellbalagot/rastjs <br/>


  * To create RastJS app, on your terminal use: 
 ``` js
 rast-app your-app-name
 ```
 
### Usage
``` js
import Rast, { initializeState, DOMnode } from "rastjs";
/** @jsx DOMnode */

const App = () => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
};

export default App;

```
  * **Note**: you need to add *//** @jsx DOMnode*/ to every .js files that uses JSX to transpile it (see the example above).
### initializeState Hook
Like react, you can also declare a state in your application using RastJS.

``` js
//State Implementation
import {DOMnode, initializeState} from 'rastjs';
/** @jsx DOMnode */
const App = () => {
  const myState = initializeState('value'); // Initialize a state
  
  const handleState = () => {
    //Change the state value
    myInput.setValue('new value');
    //You can get the value of a certain state by using:
    console.log(myState.value);
  }
  
  return;
}
export default App;
```

### initializeEffect Hook
``` js
import {DOMnode, initializeState, initializeEffect} from 'rastjs';
/** @jsx DOMnode */ 

const App = () => {
  const myState = initializeState('value'); // Initialize a state
  
  //Initialize an effect that runs whenever the **myState** value changes.
  initializeEffect([myState.value], () => {
    console.log(`myState value UPDATED to &{myState.value}`)
  });
  
  const handleState = () => {
    //Change the state value
    myInput.setValue('new value');
    //You can get the value of a certain state by using:
    console.log(myState.value);
  }
  
  return;
}
export default App;
```
## License
This repo is under the MIT license.
