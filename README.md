# Master Thesis: Powerlifting Federation Management System

> **Note:** This project is the concept and result of my master thesis. It is currently a prototype and requires further development before it can be used in production environments.

This project is a comprehensive digital platform designed to streamline and automate the management of powerlifting federations at all levels—from international governing bodies down to local clubs. The system provides a unified interface for managing federations, members, competitions, and athletes, while maintaining strict hierarchical relationships and role-based access control.

## Features
- **Federation Management**: Hierarchical structure from international to local federations, parent-child relationships, federation profiles.
- **Member Management**: Clubs, individuals, and universities as members; association with federations; athlete linkage.
- **Competition Management**: Create and manage competitions, assign hosts, set categories, manage nominations, and track results.
- **Athlete Management**: Athlete registration, profiles, performance tracking, competition history, and achievements.
- **Role-Based Access Control (RBAC)**: Basic roles for athletes, member admins, federation admins, and superadmins.
- **Public API**: Public endpoints for federations, competitions, athletes, and results.
- **Internationalization**: Multi-language support (EN, DE, FR, IT).

## Technology Stack
- **Frontend**: React 18+, TypeScript, Vite, Mantine UI, React Router, i18n
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), JWT Auth
- **API Documentation**: Swagger/OpenAPI (available at `/api-docs` when server is running)

## Project Structure
```
/server/           # Backend (Express, MongoDB, API)
/src/              # Frontend (React, TypeScript)
```
See `docs.md` for detailed architecture and module breakdown.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Environment Variables
Create a `.env` file in the root and set the following variables:
```
JWT_SECRET=your_jwt_secret_key
MONGODB_URI=mongodb://localhost:27017/powerrlift-tool
PORT=5000
NODE_ENV=development
```

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ma-powerlift-tool-v2
   npm install
   ```
2. **Start MongoDB**
   ```bash
   mongod
   ```
3. **Run the app (dev mode, both frontend and backend)**
   ```bash
   npm run dev
   ```
   Or run separately:
   ```bash
   npm run server   # Backend (default: http://localhost:5000)
   npm run client   # Frontend (default: http://localhost:5173)
   ```
4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Database Seeding (optional)
Seed federations, clubs, members, and competitions for testing:
```bash
npm run seed:federations
npm run seed:clubs
npm run seed:members
npm run seed:competitions
```

## Usage
- Access the frontend at [http://localhost:5173](http://localhost:5173)
- API server runs at [http://localhost:5000](http://localhost:5000)
- API docs available at [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## Development
- TypeScript for both frontend and backend
- ESLint for code quality
- Hot module replacement for frontend
- See `docs.md` for detailed API, architecture, and workflow documentation

## Roadmap & Future Development
- Enhanced RBAC and permission system
- Official assignment and scheduling
- Invitation and notification systems
- Advanced analytics and reporting
- Mobile app and offline support
- Full internationalization and localization

---
For detailed documentation, see [docs.md](./docs.md).
