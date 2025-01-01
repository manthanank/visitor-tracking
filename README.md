# Visitor Tracking

This is a simple visitor tracking application built with Node.js, Express, and MongoDB.

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/visitor-tracking.git
    ```

2. Navigate to the project directory:

    ```sh
    cd visitor-tracking
    ```

3. Install dependencies:

    ```sh
    npm install
    ```

4. Create a `.env` file in the root directory of the project and add the following environment variables:

    ```sh
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/visitor-tracking
    ```

5. Start the server:

    ```sh
    npm start

    # or run in development mode

    npm run dev
    ```

6. Visit `http://localhost:3000` in your browser.

## API Endpoints

### Visitors

- `GET /visits` - Get all visitors
- `POST /visit` - Create a new visitor record
- `GET /visit/:website` - Get all visitors for a specific website

## License

Distributed under the MIT License. See `LICENSE` for more information.
