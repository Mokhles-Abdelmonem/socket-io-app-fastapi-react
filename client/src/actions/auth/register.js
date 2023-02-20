import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    SET_AUTH_LOADING,
    REMOVE_AUTH_LOADING,
} from './types';
import { API_URL } from '../../config/index';



export const register = (
    email,
    first_name,
    last_name,
    password1,
    password2
) => async dispatch => {
    const body = JSON.stringify({
        email,
        first_name,
        last_name,
        password1,
        password2
    });

    dispatch({
        type: SET_AUTH_LOADING
    });

    try {
        const apiRes = await fetch(`${API_URL}/user/registration/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: body
        });
        if (apiRes.status === 201) {
            dispatch({
                type: REGISTER_SUCCESS
            });
        } else {
            dispatch({
                type: REGISTER_FAIL
            });
        }
        const res = await apiRes.json();
        return res
    } catch(err) {
        dispatch({
            type: REGISTER_FAIL
        });
    }

    dispatch({
        type: REMOVE_AUTH_LOADING
    });
};