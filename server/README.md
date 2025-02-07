# Server Startup Guide

## Prerequisites
Make sure you have the following tools installed on your machine:
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- A compatible terminal (Linux, macOS, or Windows with WSL2)

## Starting the Server

1. **Open a terminal** in the project directory.
2. **Run the following command** to start the services:
   ```sh
   docker compose up
   ```
   - This command will display all server logs.
   - You can run it in the background with:
     ```sh
     docker compose up -d
     ```

### Running Services
Two Docker containers will be running:
- **A Node.js server** to manage the application.
- **A MongoDB database** to store information.

You can now send requests to the API.

---

## Using the API

### 1. Creating a Room
Make a **POST** request to the following endpoint:

```http
POST http://localhost:3000/api/rooms
Content-Type: application/json
```

#### Request Body:
```json
{
  "roomId": "R001",
  "number": "101",
  "building": "A",
  "campus": "Campus1"
}
```

### 2. Other Requests
You can check the **routes** folder or test files to explore other available endpoints.

---

## Mobile Demo
For the [📄 POC Mobile](../mobile/POC/README.md), you must:
- Start the server.
- Ensure that the room **R001** has been created.

The database is visible locally on the browser if requests are made (see the **routes** and **test** folders).

---

## Stopping the Server
To stop the containers, use the following command:
```sh
docker compose down
```

If you want to remove associated volumes (e.g., database), add the option:
```sh
docker compose down -v
```

---

## Notes
- Make sure the required ports (e.g., 3000 for the API, 27017 for MongoDB) are not already in use.
- Check logs for errors with:
  ```sh
  docker compose logs -f
  ```
