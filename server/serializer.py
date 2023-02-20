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

