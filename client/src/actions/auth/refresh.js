import { load_user } from './getUser';
import {
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    REFRESH_SUCCESS,
    REFRESH_FAIL,
} from './types';





export const request_refresh = () => async dispatch => {
    try {
        const res = await fetch('/api/refresh', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        console.log(res);
        if (res.status === 200) {
            dispatch({
                type: REFRESH_SUCCESS
            });
            dispatch(check_auth_status());
        } else {
            dispatch({
                type: REFRESH_FAIL
            });
        }
    } catch(err) {
        dispatch({
            type: REFRESH_FAIL
        });
    }
};


export const check_auth_status = () => async dispatch => {
    try {
        const res = await fetch('/api/verify', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (res.status === 200) {
            dispatch({
                type: AUTHENTICATED_SUCCESS
            });
            dispatch(load_user());
        } else {
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }
    } catch(err) {
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};



