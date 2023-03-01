import {
    LOAD_USER_SUCCESS,
    LOAD_USER_FAIL,
    AUTHENTICATED_FAIL,
    AUTHENTICATED_SUCCESS
} from './types';
const API_URL = process.env.REACT_APP_API_URL;




export const load_user = () => async dispatch => {
    const access = localStorage.getItem('access_token');
    try {
        const res = await fetch(`${API_URL}/users/me/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${access}`
            }
        });

        const data = await res.json();
        if (res.status === 200) {
            dispatch({
                type: LOAD_USER_SUCCESS,
                payload: {user: data}
            });
            dispatch({
                type: AUTHENTICATED_SUCCESS
            });
        } else {
            dispatch({
                type: LOAD_USER_FAIL
            });
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }
    } catch(err) {
        dispatch({
            type: LOAD_USER_FAIL
        });
        dispatch({
            type: AUTHENTICATED_FAIL
        });
        return {error: 'Something went wrong when retrieving user'}
    }
};