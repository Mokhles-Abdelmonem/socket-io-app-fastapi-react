
const API_URL = process.env.REACT_APP_API_URL;


export async function register (
    username,
    email,
    password
) {
    const body = JSON.stringify({
        username,
        email,
        password
    });


    const apiRes = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    });
    if (apiRes.status === 201) {
        const res = await apiRes.json();
        console.log(res)
        return res
        
    } else {
        console.log(apiRes)
        return apiRes
    }


};