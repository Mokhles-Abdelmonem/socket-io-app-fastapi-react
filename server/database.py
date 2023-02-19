from typing import Optional


from fastapi.param_functions import Form



def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "hashed_password": user["hashed_password"],
    }