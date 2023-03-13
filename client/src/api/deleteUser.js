
const API_URL = process.env.REACT_APP_API_URL;


export async function deleteUser (username) {
    const access = localStorage.getItem('access_token');
    try {
        const apiRes = await fetch(`${API_URL}/admin_delete_users/${username}/`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${access}`
            },
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