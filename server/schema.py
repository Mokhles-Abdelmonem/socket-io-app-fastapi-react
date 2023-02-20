def ResponseModel(data, message):
    return {
        "data": data,
        "code": 200,
        "message": message,
    }


def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "hashed_password": user["hashed_password"],
    }



