# Shoptimal

## Setup (development)

Install `node` on your system and all necessary npm modules

```bash
npm install
```

Copy `.env.example` to `.env` and update any variables that you find
necessary

```bash
cp -i .env.example .env
```

Run the development docker-compose which setups the postgres database

```bash
docker compose -f docker-compose.dev.yml up -d 
```

Populate the database

```bash
npx prisma migrate dev
npx prisma db seed
```

And finally run the server

```bash
npm run dev
```

Go to http://localhost:3000
