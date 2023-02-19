import { Chat } from './Chat';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Login from './Login';
import Register from './Register';


function App() {
  return (
    <Router>
      <Switch>
          <Route path="/login">
            <Login/>
          </Route>
          <Route path="/register">
            <Register/>
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
