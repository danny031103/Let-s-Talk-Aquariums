# Let's Talk Aquariums

Let's Talk Aquariums is a full-featured, real-time chat application designed for aquarium hobbyists. It provides a platform for users to connect, share knowledge, and get advice on freshwater, saltwater, reef, and planted tanks. The application features community chat rooms, a 1-on-1 private advice system, and an AI-powered advisor.

## Features

-   **Community Chat:** Join multiple topic-based chat rooms like 'Freshwater', 'Saltwater', and 'Reef Systems' to engage in open discussions.
-   **Private Advice Chat:** Get matched 1-on-1 with an experienced hobbyist based on your experience level (Beginner, Intermediate, Advanced) and a chosen topic.
-   **AI Advisor:** An integrated AI chat assistant, powered by an OpenAI-compatible API, provides evidence-based advice on aquarium setup, livestock, and water chemistry.
-   **User Profiles & Gamification:** Create a detailed profile, upload a profile picture, and track your progress with points, badges, and a community leaderboard.
-   **Real-time Communication:** Instant messaging powered by Socket.IO for a seamless and interactive chat experience.
-   **Authentication:** Secure user registration and login system using JWT (JSON Web Tokens).
-   **Media Sharing:** Upload and share images directly within chat rooms.
-   **Moderation Tools:** Block and report users to maintain a safe and friendly community.
-   **Browser Notifications:** Receive desktop notifications for new messages, even when the application is in a background tab.

## Tech Stack

-   **Frontend:** React, React Router, Tailwind CSS, Socket.IO Client
-   **Backend:** Node.js, Express.js, Socket.IO
-   **Database:** MongoDB
-   **Authentication:** JSON Web Tokens (JWT), bcrypt
-   **Tooling:** Webpack, Babel, PostCSS, Nodemon

## Architecture

The application is built with a modern, decoupled architecture.

-   **Frontend:** A single-page application built with React and styled with Tailwind CSS. It communicates with the backend via a RESTful API service layer (`src/services/api.js`) and a real-time Socket.IO connection. User state is managed globally using React Context (`src/contexts/UserContext.js`).

-   **Backend:** A Node.js server using Express to provide REST API endpoints for authentication, profile management, and data retrieval. Socket.IO is used to handle all real-time messaging, user presence, and an advice-chat matching system. Data is persisted in a MongoDB database.

## Getting Started

To run the application locally, follow these steps.

### Prerequisites

-   Node.js (v14 or later)
-   npm
-   MongoDB instance (local or remote)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/danny031103/let-s-talk-aquariums.git
    cd let-s-talk-aquariums
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file** in the root directory and add the following environment variables. Replace the placeholder values with your own configuration.
    ```env
    # Server Configuration
    PORT=3000
    FRONTEND_URL=http://localhost:3001
    MONGODB_URI=mongodb://localhost:27017/aquarium_chat
    JWT_SECRET=your_super_secret_jwt_key

    # AI Advisor Configuration (Optional)
    AI_ENABLED=true
    OPENAI_API_KEY=your_openai_api_key
    OPENAI_API_URL=https://api.openai.com/v1/chat/completions
    OPENAI_MODEL=gpt-4o-mini
    ```

### Running the Application

You will need to run the backend server and the frontend development server in separate terminals.

1.  **Run the backend server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

2.  **Run the frontend client:**
    ```bash
    npm run dev:client
    ```
    The React application will be available at `http://localhost:3001`.

## API Endpoints

The backend provides the following RESTful API endpoints:

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Authenticate a user and receive a JWT.
-   `GET /api/auth/me`: Get the current authenticated user's data.
-   `PUT /api/users/profile`: Update the current user's profile.
-   `POST /api/users/profile/picture`: Upload a new profile picture.
-   `GET /api/chat/rooms/:roomName/messages`: Retrieve chat history for a specific community room.
-   `POST /api/ai/chat`: Send a message to the AI Advisor.
-   `GET /api/gamification/leaderboard`: Fetch the community leaderboard data.
-   `POST /api/moderation/block`: Block a user.
-   `POST /api/moderation/report`: Report a user for inappropriate behavior.
