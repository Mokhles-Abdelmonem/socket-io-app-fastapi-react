import { Chat } from './Chat';
import Game from './TicTacToe';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Switch>
          <Route path="/game">
            <Game />
          </Route>
          <Route path="/">
            <h1>Socket.io app</h1>  
            <Chat />
          </Route>
      </Switch> 
    </Router>
  );
}

export default App;
