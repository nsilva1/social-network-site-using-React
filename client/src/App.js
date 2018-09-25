import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

//Import Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';

//Import Login and Registration
import Login from './components/auth/login';
import Register from './components/auth/register';

import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Navbar />
          <Route exact path="/" component={Landing} />
          <div className="container">
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
          </div>
          <Footer />
        </div>
      </Router>
    );
  }
}

export default App;
