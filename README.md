# DB-Lens

**DB-Lens** is a powerful full-stack application designed to seamlessly connect with MySQL databases. It empowers users to generate SQL queries from natural language inputs using advanced large language models (LLMs), execute those queries, and visualize the results in an intuitive chart format.

  

## Tech Stack

- **Frontend:** React.js (utilizing functional components and hooks)
  
- **Backend:** Node.js, Express, MySQL2, Axios, Dotenv
  
- **LLM API:** Ollama (qwen2.5-coder:7b / phi:2.7b)
  
- **Database:** MySQL

  

## Requirements

| Tool    | Version     |
| ------- | ----------- |
| Node.js | v22.15.0   |
| MySQL   | 8.0.39     |
| Ollama  | 0.6.7      |
| npm     | 11.3.0     |
| React   | 19.1.0     |


  

## Installation

To set up and run **DB-Lens** on your local machine, follow these steps:

### Prerequisites

Before running the project, ensure the following:

- ✅ You have access to a MySQL database with the necessary credentials.
  
- ✅ You have Ollama installed for local LLM inference.

  

### Configure MySQL User

1. Open MySQL Workbench.
  
2. Navigate to:  
   `Server → Users and Privileges → Add Account`
  
3. Set your desired username and password.
  
4. Grant all privileges or at minimum, the SELECT privilege based on your needs.

  

### Install and Configure Ollama

1. Download Ollama from [Ollama's website](https://ollama.com).
  
2. Open your terminal and pull the required models:

   ```bash
   ollama pull qwen2.5-coder
   ollama pull phi:2.7b
   ```

3. (Optional) Test the models:

   ```bash
   ollama run qwen2.5-coder
   ollama run phi:2.7b
   ```

   **Note:**  
   - `qwen2.5-coder` is used for generating insights from SQL results.  
   - `phi:2.7b` is used for generating SQL from text prompts.  

4. Explore other models [here](https://ollama.com/search).

  

### Clone the Repository

```bash
git clone <Repo URL>
```

### Install Dependencies

1. Navigate to the backend directory:

   ```bash
   cd dblens/backend
   npm install
   ```

2. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   npm install
   ```

3. Pull the required models again (if not done earlier):

   ```bash
   ollama pull qwen2.5-coder
   ollama pull phi:2.7b
   ```

4. Run the models:

   ```bash
   ollama run qwen2.5-coder
   ollama run phi:2.7b
   ```

  

### Configure Environment Variables

In your `.env` file, set the following:

```
DB_HOST=localhost
DB_PORT=your_db_port
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
```

  

## Run the Application

### Start the Backend

Navigate to the backend directory and start the server:

```bash
cd backend
node index.js
```

- The backend will run at: [http://localhost:5000](http://localhost:5000)

  

### Start the Frontend

Navigate to the frontend directory and start the application:

```bash
cd frontend
npm start
```

- The frontend will run at: [http://localhost:3000](http://localhost:3000)

  

## Authors

- [Harshan R](https://github.com/Harshan-R)  

Feel free to reach out for any questions or contributions!
