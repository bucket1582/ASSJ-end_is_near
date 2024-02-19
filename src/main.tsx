import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style/index.css';
import { Provider, createStoreHook } from 'react-redux';
import rootReducer from './store/root-reducer.ts';

const store = createStoreHook(rootReducer);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}></Provider>
    <App />
  </React.StrictMode>,
);
