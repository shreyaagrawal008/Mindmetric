# Mindmetric

Production-ready containerized educational platform for kids from Pre-K to Grade 6.

## Features

- Dark-mode space aesthetic using `#0B0E26`
- React frontend with Tailwind CSS and Framer Motion animations
- Spring Boot REST API for authentication, weekly content, premium status, and progress logs
- MySQL schema with `users`, `weekly_lessons`, and `progress_logs`
- Seven rotating game shells with weekly content from `weekly_content.json`
- Tiered content for Pre-K/K, Grades 1-3, and Grades 4-6
- Storytelling module before each game
- Brain-Base dashboard with animated mascot
- Memory Tree mind map that gains Knowledge Leaves after wins
- Rewarded video placeholder for free users and premium skin unlocks for premium users

## Run

Install Docker Desktop, start it, then run:

```bash
docker-compose up --build
```

Open:

```text
http://localhost:5173
```

On Windows you can also double-click:

```text
run-mindmetric.bat
```

## Branding Assets

Place the user-provided images here:

```text
frontend/public/assets/WhatsApp Image 2026-05-03 at 2.15.36 PM.jpeg
frontend/public/assets/WhatsApp Image 2026-05-03 at 2.18.35 PM.jpeg
```

The app uses those exact files for the navbar/footer logo and Brain-Base mascot. Fallback assets are included so the UI remains runnable until the provided files are copied in.

## Services

```text
frontend: http://localhost:5173
backend:  http://localhost:8080
mysql:    localhost:3306
```

Demo user:

```text
username: nova
password: mindmetric
```

## Weekly Content

Update:

```text
backend/src/main/resources/weekly_content.json
frontend/public/weekly_content.json
```

Rebuild with `docker-compose up --build`.
