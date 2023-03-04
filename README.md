# Socket.io app

- This application demonstrates how to use Socket.io
- Built using FastAPI and React


In order to test out this project, follow these steps:

-   clone the repository
-   in the client folder, run: npm install, this will install the required frontend packages
-   in the client folder, run: npm start , this will run your react app
-   in the server folder, run: python3 -m venv venv
-   then activate the virtual environment: source venv/bin/activate (linux or MacOS) or venv\Scripts\activate (Windows)
-   in the server folder, run: pip install -r requirements.txt
-   in the server folder, run: python3 main.py
-   install and config mongodb as database and activate it
-   create a new database with name MokhesGame , and create collection with name users
-   if you want to change the names feel free to , but don't forget to change it in server/database.py
-   ui will navigate on port http://localhost:3000/
-   backend end point will navigate on port http://localhost:8000/
-   swagger end point will navigate on port http://localhost:8000/docs
