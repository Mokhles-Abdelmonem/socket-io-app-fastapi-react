

export const changePassword = (
    old_password,
    new_password1,
    new_password2,
) => async dispatch => {
    const body = JSON.stringify({
        old_password,
        new_password1,
        new_password2,
    });


    try {
        const apiRes = await fetch('/api/changePassword/', {
            method: 'POST',
            body: body
        });
        const res = await apiRes.json();
        return res

    } catch(err) {
        return {error: 'somthing went wrong try again'};
    }
};