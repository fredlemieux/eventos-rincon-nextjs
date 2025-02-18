# EventosRincon - Events listing for the humble sea side pueblo of Rincon de la Victoria

Forked from [NextJS Evently](https://github.com/Muhammad-Sabir/nextjs-evently), a very special
thanks to [Muhammad-Sabir](https://github.com/Muhammad-Sabir) for generously sharing this repo.❤️

## Introduction

Welcome to Evently, an event management website developed using Next.js. This application allows
users to discover, explore, and manage events seamlessly. You can access the live deployment of
Evently at [https://nextjs-evently-sabir.vercel.app/](https://nextjs-evently-sabir.vercel.app/).

## Features

- **Event Discovery:** Browse through a wide range of events by searching and filtering.
- **User Authentication:** Create an account or log in to access personalized features.
- **Event Details:** View detailed information about each event, including date, time, location, and
  description.
- **Event Registration:** Register for events you're interested in attending.
- **Create Your Own Event:** Host and manage your events on Evently.
- **Attendee Tracking:** Monitor the list of attendees for your events.
- **Payment Management:** Keep track of the money paid by attendees for your events.

## Technologies Used

- **Next.js:** A React framework for building server-side rendered and static web applications.
- **Vercel:** Hosting platform for serverless deployment of web applications.
- **Clerk:** Clerk provides a set of hooks and helpers that you can use to access the active
  session and user data in the application.
- **[Next-Intl:](https://next-intl-docs.vercel.app/)** for internationalisation (multiple languages)
- **MongoDB:** NoSQL database for data storage
- **Docker:** For the development environment, but feel free to just run the app locally too
- **Google Maps API:** Using the places API for autocompletion of Event locations

### Local Dev Tech
- **[NGROK:](https://ngrok.com/)** We need NGROK for the login webhook to work, this is fine with a one developer but 
TODO!
  we need to find a solution that doesn't entail setting up a Clerk account for every dev...
  :-(

## TODOS

- [ ] Duplicate Event name issue.  Maybe we have repeat event with the same name.
  - Duplicate event should be event with same name, same locations and same time....
- [ ] Setup Multi Stage build for Docker
- [ ] Add barrelsby for shared and ui components for cleaner import
- [ ] Clean up dev environment (clear db and users)
- [ ] bigger header user Icon
- [ ] Improve Edit and Delete buttons for mobile users
- [ ] Model for Event Image click
- [ ] focus input for datepicker
- [ ] Map out app architecture
- [ ] Translation to clark
- [ ] E2E Testing setup
- [ ] Github actions for tests
- [ ] Resizing icons in mobile view (see Event Details)
- [ ] Plan next steps
- [ ] Add sort imports
- [ ] Multi language
- [ ] Accessibility

## Project Structure

- [/app](/app) is where all application folders are stored all "\_" private prefixed folders are
  non-route
  - [/\_components](/app/_components) app-wide reusable components are stored here
  - [/\_contants](/app/_constants) app-wide constants are stored here
  - [/\_lib](/app/_lib)
  - [/\_types](/app/_types) app-wide types are stored here
  - [(auth)](</app/(auth)>) auth routes
  - [(root)](</app/(root)>) UI routes
  - [api](/app/api) api routes (no pages) -[moddleware.ts](/src/middleware.tse.ts) todo! read clerk docs

### Authentication

The app is authenticated using [Clerk](https://clerk.com) please refer to the clear webhook
[README.md](./app/api/webhook/clerk/README.md).

### File Upload

Pictures are uploaded using [UploadThing](https://uploadthing.com/) please refer to the /uploadthing
api route [README.md]()

## Getting Started

To run Evently locally, follow these steps:

### First Time

1. Clone the repository:

```bash
git clone https://github.com/Muhammad-Sabir/nextjs-evently.git
```

2. Navigate to the project directory:

```
cd nextjs-evently
```

3. Install dependencies:

```
npm install
```

4. Copy [.env.template](/.env.template) as `.env.local`
5. Setup [Clerk](http://clerk.com/) account, and add keys to `.env.local` file
6. Ensure [NGROK](https://ngrok.com/) is setup with the webhook in Clerk. See [Clerk README.MD](src/app/api/webhook/clerk/README.md)
for detail on this...

### Start Development

1. Start ngrok in one terminal (replace the url with the webhook URL used above):

```bash
ngrok http --url=yeti-brief-mastiff.ngrok-free.app 3000
```

2. Run the development server in another terminal:

```bash
docker compose up
```

3. Open your browser and go to http://localhost:3000

## Hosting

The easiest way to host is to use [Varcel](https://vercel.com/)
and [MongoDB Atlas](https://cloud.mongodb.com):

- Create a DB in Atlas
- Ensure you have connections from anywhere enabled!!! TODO! Lock this down
- Create an account
- Import the github project
- Use all default builds
- Make sure you assign all ENV VARS!

## Testing
For testing with a MongoDb instance we are using [mongodb-memory-server](https://typegoose.github.io/mongodb-memory-server/),
see the [test README.md](./test/README.md) file for more details.

To run tests:
```bash
npm run test
```

and in watch mode:
```bash
npm run test:watch
```

## Troublehoot

501 Timeout from Varcel, I got this error due to not enabling connections from anywhere for the
database. The logs wheren't very helpful, TODO! learn about how to debug using Varcel Logs?!
