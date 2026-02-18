import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {KeycloakProvider} from './contexts/auth/KeycloakContext';
import {SnackbarProvider} from 'notistack';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
      <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{vertical: 'top', horizontal: 'center'}}
          autoHideDuration={4000}
      >
          <KeycloakProvider>
              <App/>
          </KeycloakProvider>
      </SnackbarProvider>
  </React.StrictMode>
);
