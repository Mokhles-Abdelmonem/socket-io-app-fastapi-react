import motor.motor_asyncio 

MONGO_DETAILS = "mongodb://localhost:27017"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_DETAILS)

database = client.MokhlesGame

users_collection = database.get_collection("users")
role_collection = database.get_collection("roles")