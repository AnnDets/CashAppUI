import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from 'react-router-dom';
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import {useAuth} from './contexts/auth/KeycloakContext';
import {MainLayout} from './components/layout/MainLayout';
import {Loader} from './components/common/Loader';
import {LoginPage} from './components/login/LoginPage';
import {Dashboard} from './components/dashboard/Dashboard';
import {AccountList} from './components/accounts/AccountList';
import {AccountForm} from './components/accounts/AccountForm';
import {OperationList} from './components/operations/OperationList';
import {OperationForm} from './components/operations/OperationForm';
import {CategoryList} from './components/categories/CategoryList';
import {CategoryForm} from './components/categories/CategoryForm';
import {PlaceList} from './components/places/PlaceList';
import {PlaceForm} from './components/places/PlaceForm';
import {UserProfile} from './components/profile/UserProfile';

const theme = createTheme({
    palette: {
        primary: {main: '#1976d2'},
        secondary: {main: '#388e3c'},
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiCard: {
            defaultProps: {variant: 'outlined'},
        },
    },
});

const App: React.FC = () => {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return <Loader message="Initializing..."/>;
    }

  return (
      <ThemeProvider theme={theme}>
          <CssBaseline/>
          <BrowserRouter basename="/app">
              <Routes>
                  {isAuthenticated ? (
                      <Route element={<MainLayout/>}>
                          <Route path="/" element={<Dashboard/>}/>
                          <Route path="/accounts" element={<AccountList/>}/>
                          <Route path="/accounts/new" element={<AccountForm/>}/>
                          <Route path="/accounts/:id" element={<AccountForm/>}/>
                          <Route path="/operations" element={<OperationList/>}/>
                          <Route path="/operations/new" element={<OperationForm/>}/>
                          <Route path="/categories" element={<CategoryList/>}/>
                          <Route path="/categories/new" element={<CategoryForm/>}/>
                          <Route path="/places" element={<PlaceList/>}/>
                          <Route path="/places/new" element={<PlaceForm/>}/>
                          <Route path="/profile" element={<UserProfile/>}/>
                          <Route path="*" element={<Navigate to="/" replace/>}/>
                      </Route>
                  ) : (
                      <>
                          <Route path="/login" element={<LoginPage/>}/>
                          <Route path="*" element={<Navigate to="/login" replace/>}/>
                      </>
                  )}
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  );
};

export default App;
