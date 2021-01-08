var nextWorkLoad = null;
var rootRef = null;
var wipRoot = null;
var deletes = null;
var wipFiber = null;
var hookIndex = null;
var effectTypes = {
  init: "initialize",
  cancel: "cancel",
};

//create virtual dom nodes
const DOMnode = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child !== "object"
          ? {
              type: "plainText",
              props: { nodeValue: child, children: [] },
            }
          : child
      ),
    },
  };
};

//assign the root element as nextworkload
const renderDOM = (element, container) => {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: rootRef,
  };
  deletes = [];
  nextWorkLoad = wipRoot;
};

//create dom nodes
const createDOM = (fiber) => {
  const node =
    fiber.type === "plainText"
      ? document.createTextNode("")
      : document.createElement(fiber.type);
  updateDOM(node, {}, fiber.props);
  return node;
};

//filtering methods
const isEvent = (key) => key.startsWith("event");
const isProp = (key) => key !== "children" && !isEvent(key);
const destroyProps = (prev, next) => (key) => !(key in next);
const newProps = (prev, next) => (key) => prev[key] !== next[key];
// Update the dom; process the nodes and create fibers for reconciliation
const updateDOM = (dom, prevProps, nextProps) => {
  //remove listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || newProps(prevProps, nextProps)(key))
    .forEach((ev) => {
      const eventType = ev.toLowerCase().substring(5);
      dom.removeEventListener(eventType, prevProps[ev]);
    });
  //remove props
  Object.keys(prevProps)
    .filter(isProp)
    .filter(destroyProps(prevProps, nextProps))
    .forEach((prop) => {
      dom[prop] = "";
    });
  //updateProps (styles, clasName, etc..)
  Object.keys(nextProps)
    .filter(isProp)
    .filter(newProps(prevProps, nextProps))
    .forEach((prop) => {
      if (prop === "style") {
        // update if prop style
        transformDomStyle(dom, nextProps.style);
      } else if (prop === "className") {
        // update if prop className
        prevProps.className &&
          dom.classList.remove(...prevProps.className.split(/\s+/));
        dom.classList.add(...nextProps.className.split(/\s+/));
      } else {
        dom[prop] = nextProps[prop]; //append props if not default html element prop
      }
    });
  //addevent
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(newProps(prevProps, nextProps))
    .forEach((ev) => {
      const eventType = ev.toLowerCase().substring(5);
      dom.addEventListener(eventType, nextProps[ev]);
    });
};
// Transform styles
const reg = /[A-Z]/g;
function transformDomStyle(dom, style) {
  dom.style = Object.keys(style).reduce((acc, styleName) => {
    const key = styleName.replace(reg, function (v) {
      return "-" + v.toLowerCase();
    });
    acc += `${key}: ${style[styleName]};`;
    return acc;
  }, "");
}

//runeffects
const activateEffects = (fiber, type) => {
  fiber.hooks &&
    type === effectTypes.cancel &&
    fiber.hooks
      .filter((hook) => hook.tag === "effect" && hook.cancelCallback)
      .forEach((effect) => effect.cancelCallback());
  fiber.hooks &&
    type === effectTypes.init &&
    fiber.hooks
      .filter((hook) => hook.tag === "effect" && hook.callback)
      .forEach((effect) => {
        effect.cancelCallback = effect.callback();
      });
};

//commit vdom nodes to the dom
const commitRoot = () => {
  deletes.forEach(commitWork);
  commitWork(wipRoot.child);
  rootRef = wipRoot;
  wipRoot = null;
};

const commitWork = (fiber) => {
  if (!fiber) return;
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  fiber.effectTag === "CREATE" &&
    (fiber.dom != null && domParent.appendChild(fiber.dom),
    activateEffects(fiber, effectTypes.init));
  fiber.effectTag === "UPDATE" &&
    (activateEffects(fiber, effectTypes.cancel),
    fiber.dom != null &&
      updateDOM(fiber.dom, fiber.alternate.props, fiber.props),
    activateEffects(fiber, effectTypes.init));
  if (fiber.effectTag === "DESTROY") {
    activateEffects(fiber, effectTypes.cancel);
    commitDelete(fiber, domParent);
    return;
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
};

const commitDelete = (fiber, domParent) => {
  fiber.dom && domParent.removeChild(fiber.dom);
  !fiber.dom && commitDelete(fiber.child, domParent);
};

// Concurrent process
const workLoadLoop = (deadline) => {
  let yieldStatus = false;
  while (nextWorkLoad && !yieldStatus) {
    nextWorkLoad = performWorkLoad(nextWorkLoad);
    yieldStatus = deadline.timeRemaining() < 1;
  }
  !nextWorkLoad && wipRoot && commitRoot();
  requestIdleCallback(workLoadLoop);
};

requestIdleCallback(workLoadLoop);
//Process the assigned workload
const performWorkLoad = (fiber) => {
  const isFuncComponent = fiber.type instanceof Function;
  isFuncComponent && updateFuncComponent(fiber);
  !isFuncComponent && updateHostComponent(fiber);
  if (fiber.child) return fiber.child;
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
};
// if functional component, call the function and process the return values
const updateFuncComponent = (fiber) => {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  diff(fiber, children);
};

//initialize state
const initializeValue = (initialState) => {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initialState,
    queue: [],
  };
  //process actions
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action;
  });
  //return function to modify state
  const setValue = (action) => {
    hook.queue.push(action);
    wipRoot = {
      dom: rootRef.dom,
      props: rootRef.props,
      alternate: rootRef,
    };
    nextWorkLoad = wipRoot;
    deletes = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return {
    value: hook.state,
    setValue: setValue,
  };
};

const initializeEffect = (accumulator, callback) => {
  const accuChanged = (prevAccu, nextAccu) =>
    !prevAccu ||
    !nextAccu ||
    prevAccu.length !== nextAccu.length ||
    prevAccu.some((val, idx) => val !== nextAccu[idx]);
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex]; // returns the  work in progress fiber alternate hooks
  const hooksChanged = accuChanged(
    oldHook ? oldHook.accumulator : undefined,
    accumulator
  );
  const newHook = {
    tag: "effect",
    callback: hooksChanged ? callback : null,
    cancelCallback: hooksChanged && oldHook && oldHook.cancelCallback,
    accumulator,
  };
  wipFiber.hooks.push(newHook);
  hookIndex++;
};

const updateHostComponent = (fiber) => {
  !fiber.dom && (fiber.dom = createDOM(fiber));
  const elements = fiber.props.children.flat();
  //run diff if component updates
  diff(fiber, elements);
};

//Diffing algorithm
const diff = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  const createNewFiber = (type, props, dom, parent, alternate, effectTag) => {
    return {
      type: type,
      props: props,
      dom: dom,
      parent: parent,
      alternate: alternate,
      effectTag: effectTag,
    };
  };
  //Assign a tag per node (CREATEe, UPDATE, DESTOY)
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    const sameType = oldFiber && element && element.type == oldFiber.type;
    sameType &&
      (newFiber = createNewFiber(
        oldFiber.type,
        element.props,
        oldFiber.dom,
        wipFiber,
        oldFiber,
        "UPDATE"
      ));
    !sameType &&
      element &&
      (newFiber = createNewFiber(
        element.type,
        element.props,
        null,
        wipFiber,
        null,
        "CREATE"
      ));
    if (!sameType && oldFiber) {
      oldFiber.effectTag = "DESTROY";
      deletes.push(oldFiber);
    }
    oldFiber && (oldFiber = oldFiber.sibling);
    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element && prevSibling) {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
};

const Rast = { DOMnode, renderDOM, initializeValue, initializeEffect };
export { DOMnode, renderDOM, initializeValue, initializeEffect };
export default Rast;
