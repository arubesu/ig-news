import { Client } from 'faunadb';

export const faunadbClient = new Client(
  {
    secret: process.env.FAUNA_DB_SECRET_KEY,
  }
)
