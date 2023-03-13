
const API_URL = process.env.REACT_APP_API_URL;


export async function updateUsers (username,level,disabled) {
    const access = localStorage.getItem('access_token');
    const body = JSON.stringify({
        level,
        disabled
    });
    console.log("body",body);
    try {
        const apiRes = await fetch(`${API_URL}/admin_update_users/${username}/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access}`
            },
            body: body
        });
        const res = await apiRes.json();
        if (apiRes.status === 200) {
            return res;
        } else {
            console.log('Error', apiRes.status, res);
            return apiRes.error
        }
    } catch(err) {
        return {error: 'somthing went wrong try again'};
    }


};