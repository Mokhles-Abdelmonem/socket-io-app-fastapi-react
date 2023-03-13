
const API_URL = process.env.REACT_APP_API_URL;




export async function get_users () {
    const access = localStorage.getItem('access_token');
    try {
        const res = await fetch(`${API_URL}/users/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${access}`
            }
        });

        const data = await res.json();
        if (res.status === 200) {
            return data;
        } else {
            console.log('Error', res.status, res);
            return res.error
        }
    } catch(err) {
        return {error: 'Something went wrong when retrieving users'}
    }
};