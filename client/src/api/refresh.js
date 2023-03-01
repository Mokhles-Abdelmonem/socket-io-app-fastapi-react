import { load_user } from './getUser';
import {
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    REFRESH_SUCCESS,
    REFRESH_FAIL,
} from './types';
const API_URL = process.env.REACT_APP_API_URL;





export const request_refresh = () => async dispatch => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
        dispatch({
            type: REFRESH_FAIL
        });
    }

    try {
        const res = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${refresh}`
            }
        });
        const data = await res.json();
        if (res.status === 200) {
            dispatch({
                type: REFRESH_SUCCESS
            });
            localStorage.setItem('access_token', data.access_token);
            dispatch(load_user());
        } else {
            dispatch({
                type: REFRESH_FAIL
            });
            dispatch({
                type: AUTHENTICATED_FAIL
            });
        }
    } catch(err) {
        dispatch({
            type: REFRESH_FAIL
        });
        dispatch({
            type: AUTHENTICATED_FAIL
        });
    }
};


// export const check_auth_status = () => async dispatch => {
//     try {
//         const res = await fetch('/api/verify', {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//             }
//         });

//         if (res.status === 200) {
//             dispatch({
//                 type: AUTHENTICATED_SUCCESS
//             });
//             dispatch(load_user());
//         } else {
//             dispatch({
//                 type: AUTHENTICATED_FAIL
//             });
//         }
//     } catch(err) {
//         dispatch({
//             type: AUTHENTICATED_FAIL
//         });
//     }
// };



