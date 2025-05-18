# Lavie Manga Blog

A modern manga blog platform built with Next.js, Prisma, PostgreSQL, and TypeScript.

---

## Features

- User authentication (NextAuth.js: credentials & Google)
- Role-based access control (Admin, User)
- Session management (view, revoke, device/IP/location tracking)
- Blog posts with categories, tags, media, comments, and votes
- Admin notes, audit logs, and notification preferences
- Fully typed with TypeScript
- Prisma ORM with PostgreSQL
- Easy database seeding for development

---

## Getting Started

### 1. **Clone the Repository**

```sh
git clone https://github.com/yourusername/lavie-manga-blog.git
cd lavie-manga-blog
```

### 2. **Install Dependencies**

```sh
npm install
```

### 3. **Configure Environment Variables**

Copy `.env.example` to `.env` and fill in your database and auth credentials:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lavie_dev
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. **Set Up the Database**

#### **Run Migrations**

```sh
npx prisma migrate dev --name init
```

#### **Generate Prisma Client**

```sh
npx prisma generate
```

#### **Seed the Database**

```sh
npx prisma db seed
```

This will insert sample data for all tables (users, roles, posts, etc.).

---

## Development

### **Start the Dev Server**

```sh
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

---

## Session Management

- Sessions are stored in the database (`Session` table).
- Device info, IP, and location are tracked per session.
- Users can view and revoke sessions from their profile/settings.
- Passwords are securely hashed (bcrypt).

---

## Seeding

- The seed script (`prisma/seed.ts`) inserts:
  - Sample users (admin, alice, bob, eve, mallory)
  - Roles, permissions, and role assignments
  - Categories, tags, posts, comments, votes, media, etc.
- To run the seed script:
  ```sh
  npx prisma db seed
  ```

---

## Scripts

| Command                      | Description                        |
|------------------------------|------------------------------------|
| `npm run dev`                | Start Next.js dev server           |
| `npx prisma migrate dev`     | Run migrations                     |
| `npx prisma generate`        | Generate Prisma client             |
| `npx prisma db seed`         | Seed the database                  |
| `npx prisma studio`          | Open Prisma Studio (DB GUI)        |

---

## Authentication

- NextAuth.js with credentials and Google providers.
- Custom session and user logic in `src/lib/authOptions.ts`.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'Add foo'`)
4. Push to the branch (`git push origin feature/foo`)
5. Create a new Pull Request

---

## License

MIT

---

## Credits

- [Next.js](https://nextjs.org/)
- [Prisma](https://prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Lucide Icons](https://lucide.dev/)
- [Sonner](https://sonner.emilkowal.ski/) (for toasts)

---

## Contact

For questions or support, open an issue or contact [your email/contact here].