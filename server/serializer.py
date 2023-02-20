from typing import Optional


from fastapi.param_functions import Form
from pydantic import BaseModel
from typing import Union


class RegisterJson(BaseModel):
    """
    """
    username: str
    email: Union[str, None] = None
    password: str




class LoginJson(BaseModel):
    """
    """
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str

class TokenForm(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Union[str, None] = None


class User(BaseModel):
    username: str
    email: Union[str, None] = None
    disabled: Union[bool, None] = None


class UserInDB(User):
    hashed_password: str

class Settings(BaseModel):
    authjwt_secret_key: str = "secret"

