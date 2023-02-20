import {
    LOGOUT_SUCCESS,
    LOGOUT_FAIL,
} from './types';
export const logout = () => async dispatch => {
    try {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

            dispatch({
                type: LOGOUT_SUCCESS
            });

    } catch(err) {
        dispatch({
            type: LOGOUT_FAIL
        });
    }
};