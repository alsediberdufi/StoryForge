# StoryForge API

StoryForge is a full-stack social content platform API built with FastAPI, PostgreSQL, and JWT authentication. Users can publish stories, search users and content, like, comment, save stories, and manage public profiles. The project includes role-based admin authorization for moderation features.

## Tech Stack

- Python
- FastAPI
- SQLAlchemy ORM
- PostgreSQL
- Pydantic
- JWT authentication with `python-jose`
- Password hashing with `passlib` and bcrypt
- Environment variables with `python-dotenv`
- Uvicorn

## Project Structure

```text
storyforge-api/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── auth.py
│   ├── dependencies.py
│   └── routes/
│       ├── auth.py
│       ├── users.py
│       ├── stories.py
│       ├── likes.py
│       ├── comments.py
│       ├── saved.py
│       └── admin.py
├── requirements.txt
├── README.md
├── .env
└── .gitignore
```

## Setup

1. Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a PostgreSQL database:

```sql
CREATE DATABASE storyforge_db;
```

4. Update `.env` if your local PostgreSQL credentials differ:

```env
DATABASE_URL=postgresql+psycopg2://postgres:password@localhost:5432/storyforge_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

5. Run the API:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

Swagger docs are available at `http://127.0.0.1:8000/docs`.

## Authentication

StoryForge uses JWT bearer authentication.

Register:

```http
POST /auth/register
```

Login:

```http
POST /auth/login
```

The login endpoint uses OAuth2 form data. Send the user's email in the `username` field and their password in the `password` field.

Authenticated requests should include:

```http
Authorization: Bearer <token>
```

## Implemented Endpoints

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Users

- `GET /users/search?query=alsedi`
- `GET /users/{user_id}`
- `GET /users/{user_id}/stories`
- `GET /users/{user_id}/saved-stories`

### Stories

- `POST /stories`
- `GET /stories`
- `GET /stories/{story_id}`
- `PUT /stories/{story_id}`
- `DELETE /stories/{story_id}`

Story listing supports:

- `GET /stories?search=football`
- `GET /stories?category=tech`
- `GET /stories?page=1&limit=10`

### Likes

- `POST /stories/{story_id}/like`
- `DELETE /stories/{story_id}/like`
- `GET /stories/{story_id}/likes`

### Comments

- `POST /stories/{story_id}/comments`
- `GET /stories/{story_id}/comments`
- `DELETE /comments/{comment_id}`

### Saved Stories

- `POST /stories/{story_id}/save`
- `DELETE /stories/{story_id}/save`
- `GET /me/saved-stories`

### Admin

- `GET /admin/users`
- `DELETE /admin/stories/{story_id}`
- `DELETE /admin/comments/{comment_id}`
- `PATCH /admin/users/{user_id}/deactivate`

## Authorization Rules

- JWTs identify the authenticated user by user id.
- Users have a `role`: `user` or `admin`.
- Normal users can manage only their own stories and comments.
- Admin users can view all users, delete any story, delete any comment, and deactivate users.
- Unpublished stories are visible only to their owner or an admin.
- Public story lists show only published stories.
- Public user profiles expose only public fields.
- Saved stories are visible only to the owner unless `saved_stories_public` is enabled.
- Duplicate likes and saved stories are prevented with database-level unique constraints.

## Development Notes

This starter uses `Base.metadata.create_all()` during FastAPI startup so the first run creates tables automatically. For production deployments, add Alembic migrations before changing models over time.

Uploaded images are stored locally in `uploads/` and served from `/uploads`. That folder is ignored by git.

## Frontend

The React + Axios + TailwindCSS frontend lives in `../frontend`.

Run it with:

```bash
cd ../frontend
npm install
npm run dev
```
