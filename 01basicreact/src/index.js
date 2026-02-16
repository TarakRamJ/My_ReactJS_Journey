import React from 'react';
import ReactDOM from 'react-dom/client';
import Check from './components/Check';
import List from './components/List';
import Event from './components/Event';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Check />
    <hr/>
    <List />
    <hr/>
    <Event />
    <hr/>
  </React.StrictMode>
);
