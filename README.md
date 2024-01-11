<div align="center">
<img src="./react-hook-simple-state.png" alt="react-hook-simple-state">
<h3>react global state manager</h3>
<h4>Support React</h4>
</div>

### Features
- 😎 Easy!!!
- 😎 Support hook
- 😎 Better performance optimization

### Install
```sh
npm i react-hook-simple-state

# yarn add react-hook-simple-state
# pnpm add react-hook-simple-state
```

### Usage
```tsx
import { useStore } from "react-hook-simple-state";



// for hook component
function App() {
  const [store,setStore] = useStore('countStoreKey',{count:0});
  return (
    <>
      {count}
      <button onClick={() => setStore({count: store.count + 1})}>+</button>
      <DemoCompoment />
    </>
  );
}

function DemoCompoment() {
  const [store,setStore] = useStore('countStoreKey',{count:0});
    return (
    <>
      {count}
    </>
  );
}

```

## Basic API
react-hook-simple-state requires the version of React v >= 16.8

| API             | Description                                                  |
|-----------------|--------------------------------------------------------------|
| useStore     | Create a store container for state                              |
