import axios from 'axios';
import { GET_ERRORS, SET_CURRENT_USER } from './types';
import jwt_decode from 'jwt-decode';

// Import Function to apply token to every request from logged in user
import setAuthToken from '../utils/setAuthToken';

//Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/api/users/register', userData)
    .then(res => history.push('/login'))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login - Get User Token
export const loginUser = userData => dispatch => {
  axios
    .post('/api/users/login', userData)
    .then(res => {
      //Save Token in Local Storage
      const { token } = res.data;
      //Set Token to Local Storage
      localStorage.setItem('jwtToken', token);
      //Set Token to auth Header
      setAuthToken(token);
      //Decode token to get user data
      const decoded = jwt_decode(token);
      //Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Set Logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};
