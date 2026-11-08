# Creative CRM

Creative CRM is a personal customer relationship manager for organizing contacts, follow-ups, tasks, and calendar activity around the Google account you choose to connect.

## Project status

Early development. The current app is a responsive dashboard with sample tasks and calendar activity. Contacts can be added, edited, searched, and deleted; contact records are saved in the current browser using local storage. Google sign-in and synchronization are not implemented, and no Google account is accessed.

## Getting started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run lint
npm run build
```

## Planned integrations

- **Google Sheets** — CRM records and configurable data storage
- **Google Contacts** — people and contact details
- **Google Calendar** — meetings, reminders, and follow-ups
- **Google Tasks** — to-do items linked to CRM activity

The app will clearly explain which Google services it accesses and keep users in control of their data.

## Planned technology

- Next.js with the App Router
- TypeScript
- Google Identity Services / OAuth 2.0
- Google APIs for Sheets, People, Calendar, and Tasks

Google Cloud OAuth configuration and enabled APIs will be needed before Google integrations can be developed and tested.
