import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    SET_AUTH_LOADING,
    REMOVE_AUTH_LOADING,
    RESET_REGISTER_SUCCESS,
} from './types';
import { load_user } from './getUser';
const API_URL = process.env.REACT_APP_API_URL;



export const login = (username, password) => async dispatch => {
    const body = JSON.stringify({
        username,
        password
    });

    dispatch({
        type: SET_AUTH_LOADING
    });

    try {
        const res = await fetch(`${API_URL}/login/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: body
        });

        const data = await res.json();

        if (res.status === 200) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            dispatch({
                type: LOGIN_SUCCESS
            });
            dispatch(load_user());
            return true
        } else {
            dispatch({
                type: LOGIN_FAIL
            });
            return data
        }
    } catch(err) {
        dispatch({
            type: LOGIN_FAIL
        });
        return false;

    }

    dispatch({
        type: REMOVE_AUTH_LOADING
    });
    return true;
};



export const reset_register_success = () => dispatch => {
    dispatch({
        type: RESET_REGISTER_SUCCESS
    });
};
