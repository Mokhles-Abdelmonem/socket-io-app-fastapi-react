from typing import Optional

from fastapi import Path
from fastapi.param_functions import Form
from pydantic import BaseModel, Field
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
    joined: Union[bool, None] = None
    in_room: Union[bool, None] = None
    room_number: Union[str, None] = None
    sid: Union[str, None] = None
    side: Union[str, None] = None
    status: Union[str, None] = None
    level: Union[int, None] = None
    win_number: Union[int, None] = None
    player_won: Union[bool, None] = None
    player_lost: Union[bool, None] = None
    player_draw: Union[bool, None] = None
    connected: Union[bool, None] = None

class UserInDB(User):
    hashed_password: str

class Settings(BaseModel):
    authjwt_secret_key: str = "secret"




class MessageJson(BaseModel):
    """
    """
    text: Union[str, None] = None




class RoleJson(BaseModel):
    """
    """
    winning_number: int = Field(ge=1)
    roles: list[list[int]] 