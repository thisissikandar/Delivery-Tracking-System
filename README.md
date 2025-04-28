# Quick Commerce

A simple Quick Commerce project built with Next.js.

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Create the `.env` file

Create a `.env` file in the root of the project and add the following environment variables:

```env
JWT_SECRET=example
MONGODB_URI=mongodb://localhost:2027/quick-commerce
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Ensure MongoDB is running locally on port `2027` or update the URI accordingly.

### 3. Install dependencies

Use [pnpm](https://pnpm.io/) to install the project dependencies:

```bash
pnpm install
```

### 4. Run the development server

Start the local development server:

```bash
pnpm run dev
```

The application should now be running at [http://localhost:3000](http://localhost:3000)!
