

export const updateProfille = (
    email,
    first_name,
    last_name,
) => async dispatch => {
    const body = JSON.stringify({
        email,
        first_name,
        last_name,
    });


    try {
        const apiRes = await fetch('/api/updateProfile/', {
            method: 'POST',
            body: body
        });
        const res = await apiRes.json();
        return res
    } catch(err) {
        return {error: 'somthing went wrong try again'};
    }


};