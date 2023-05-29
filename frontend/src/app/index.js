//Module imports
import React from 'react';
import { createRoot } from 'react-dom/client';

//App import
import VirtualMachine from './virtualmachine.js';

const container = document.getElementById('app');
const userToken = document.getElementById('user-token').value;
const logoutUrl = document.getElementById('logout-url').value;
const root      = createRoot(container);
root.render(<VirtualMachine token={userToken} logoutUrl={logoutUrl} />);