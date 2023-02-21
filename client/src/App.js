import * as React from 'react';
import { Chat } from './Chat';
import { Provider } from 'react-redux'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Login from './Login';
import Register from './Register';
import Layout from './layout/Layout';
import useStore from './store';
import Game from './TicTacToeGame';
import JoinButton from './components/socket/JoinButton';
import GeneralRoom from './GeneralRoom';


export default function App(pageProps) {
  const store = useStore(pageProps.initialReduxState);
  const LayoutComponent =  Layout;
  return (
    <Provider store={store}>
    <Router>
      <Switch>
        <Route path="/login">
          <Login/>
        </Route>
        <Route path="/register">
          <Register/>
        </Route>
        <Route path="/dashboard">
          <LayoutComponent> 
            <GeneralRoom />
          </LayoutComponent>
        </Route>
        <Route path="/tictactoe">
          <LayoutComponent> 
            <Game />
          </LayoutComponent>
        </Route>
        <Route path="/">
          <LayoutComponent> 
            <JoinButton />
          </LayoutComponent>
        </Route>
    </Switch> 
  </Router>
  </Provider>

  );
}
