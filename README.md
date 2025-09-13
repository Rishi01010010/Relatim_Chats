# Relatim Chat - WhatsApp-style Messaging App

A full-stack messaging application built with MERN stack and PostgreSQL, featuring real-time messaging, contact management, and a modern UI.

## Features

- 🔐 User authentication (login/register)
- 💬 Real-time messaging with Socket.io
- 👥 Contact management
- 📱 Responsive WhatsApp-style UI
- 🗄️ PostgreSQL database
- ⚡ Real-time typing indicators
- 📊 Online/offline status

## Tech Stack

- **Frontend**: React, Styled Components, React Icons, React Hot Toast
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Real-time**: Socket.io

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Database Setup

1. Make sure PostgreSQL is running on your system
2. Create a database named `relatim_chat`:
   ```sql
   CREATE DATABASE relatim_chat;
   ```

3. Run the schema file to create tables:
   ```sql
   \c relatim_chat
   \i server/database/schema.sql
   ```

## Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies for all parts of the application:
   ```powershell
   npm run install-all
   ```

3. Set up environment variables:
   - The server configuration is already set up in `server/config.env`
   - Update the database credentials if needed

## Running the Application

1. Start the development servers (both backend and frontend):
   ```powershell
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend React app on http://localhost:3000

2. Open your browser and navigate to http://localhost:3000

## Manual Setup (Alternative)

If you prefer to run the servers separately:

1. **Backend Server**:
   ```powershell
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Client** (in a new terminal):
   ```powershell
   cd client
   npm install
   npm start
   ```

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Add Contacts**: Go to the Contacts tab and add users by username or email
3. **Start Chatting**: Click on a contact to start a conversation
4. **Real-time Messaging**: Send and receive messages in real-time
5. **Manage Chats**: Switch between different conversations in the Chat tab

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Contacts
- `GET /api/contacts` - Get user's contacts
- `POST /api/contacts` - Add a contact
- `DELETE /api/contacts/:id` - Remove a contact
- `GET /api/contacts/search` - Search users

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get chat details

### Messages
- `GET /api/messages/:chatId` - Get messages for a chat
- `POST /api/messages` - Send a message
- `DELETE /api/messages/:id` - Delete a message

## Socket.io Events

### Client to Server
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server to Client
- `new_message` - New message received
- `user_typing` - User started typing
- `user_stopped_typing` - User stopped typing
- `user_status_changed` - User status changed

## Database Schema

The application uses the following main tables:
- `users` - User accounts
- `chats` - Chat rooms (direct messages or groups)
- `chat_participants` - Many-to-many relationship between users and chats
- `messages` - Chat messages
- `contacts` - User's contact list

## Troubleshooting

1. **Database Connection Issues**: Ensure PostgreSQL is running and credentials are correct
2. **Port Conflicts**: Make sure ports 3000 and 5000 are available
3. **Socket.io Issues**: Check that both frontend and backend are running
4. **CORS Issues**: The backend is configured to allow requests from localhost:3000

## Development

- Frontend: React with functional components and hooks
- Backend: Express.js with middleware for authentication
- Real-time: Socket.io for instant messaging
- Database: PostgreSQL with connection pooling
- Styling: Styled Components for component-based styling

## License

MIT License - feel free to use this project for learning and development purposes.
