# Currency Exchange Application

## 🚀 Description

This project is a sophisticated currency exchange platform that offers:

- **API for Currency Exchange**: Calculate and perform currency exchanges with ease.
- **Real-time Updates**: Stay updated with the latest currency reserves through WebSockets.
- **Interactive Front-end**: A sleek React-based interface for an enhanced user experience.

The application leverages Domain-Driven Design (DDD) principles and supports both in-memory and PostgreSQL databases.
For testing convenience, the default mode is in-memory, but you can easily switch the repository implementation,
see`src/app.module`.

## 🛠️ Installation

Get started with the following commands:

```bash
$ npm install
```

## 🚀 Running the Application

Choose your preferred mode to run the application:

### Development Mode

```bash
$ npm run start
```

### Watch Mode

```bash
$ npm run start:dev
```

### Production Mode

```bash
$ npm run start:prod
```

Once the application is running, you can access the frontend at http://localhost:3000

## 🧪 Testing

Ensure the robustness of the application with these commands:

### Unit Tests

```bash
$ npm run test
```

### End-to-End Tests

```bash
$ npm run test:e2e
```

## 🌟 Features

- **Currency Exchange API**: Endpoints for calculating and performing currency exchanges.
- **Real-time Updates**: WebSocket integration for live updates of currency reserves.
- **Front-end Interface**: A React-based interface for user interactions.

## 🛠️ Technologies Used

- **Backend**: NestJS, TypeScript, MikroORM, PostgreSQL, EventEmitter, DDD
- **Frontend**: React, Axios, Socket.IO
- **Testing**: Jest

## 📁 Project Structure

```
currency-exchange/
├── src/
│   ├── application/
│   ├── domain/
│   │   ├── core/
│   │   ├── exchange/
│   │   └── reserve/
│   ├── infrastructure/
│   │   └── persistence/
│   │       ├── memory/
│   │       └── mikro-orm/
│   └── interfaces/
│       ├── http/
│       │   └── client/
│       └── websocket/
├── test/
└── README.md
```

- `src/`: Contains the main application code
    - `application/`: Application services and DTOs
    - `domain/`: Core domain logic and entities
    - `infrastructure/`: Implementation details (e.g., database)
    - `interfaces/`: API controllers and client-side code
- `test/`: Contains test files
