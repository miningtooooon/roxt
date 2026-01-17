# Backend (Express + MongoDB)

## Run locally
1) Copy `.env.example` to `.env` and fill values.
2) Install & start:
```bash
npm install
npm run dev
```

## Admin secret code hash
Generate a bcrypt hash:
```bash
node -e "import bcrypt from 'bcryptjs'; bcrypt.hash(process.argv[1],10).then(console.log)" "YOUR_SECRET_CODE"
```
Put the output into `ADMIN_CODE_HASH`.
