const { db } = require('@vercel/postgres');
const { points_seed } = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

// async function seedCards(client) {
//   try {
//     // Create the "users" table if it doesn't exist
//     const createTable = await client.sql`
//     CREATE TABLE cards (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(255) UNIQUE
//     );
//   `;

//     console.log(`Created "users" table`);

//     // Insert data into the "users" table
//     const insertedCards = await Promise.all(
//       cards.map(async (card) => {
//         return client.sql`
//         INSERT INTO Cards (name)
//         VALUES (${card.name})
//         ON CONFLICT DO NOTHING;
//       `;
//       }),
//     );

//     console.log(`Seeded ${insertedCards.length} cards`);

//     return {
//       createTable,
//       users: insertedCards,
//     };
//   } catch (error) {
//     console.error('Error seeding cards:', error);
//     throw error;
//   }
// }

async function seedPoints(client) {
  try {
    await client.sql`DROP TABLE IF EXISTS points;`;
    // Create the "points" table if it doesn't exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS points (
      id SERIAL PRIMARY KEY,
      card_name VARCHAR(255) UNIQUE,
      points DECIMAL(10, 2),    
      week_start_date DATE,
      UNIQUE (card_name, week_start_date)
    );
  `;

    console.log(`Created "points" table`);

    // Insert data into the "invoices" table
    const insertedPoints = await Promise.all(
      points_seed.map(
        (points) => client.sql`
        INSERT INTO points (card_name, points, week_start_date)
        VALUES (${points.card_name}, ${points.points}, ${points.week_start_date})
        ON CONFLICT (card_name, week_start_date)
        DO UPDATE SET card_name = excluded.card_name, points = excluded.points, week_start_date = excluded.week_start_date;
      `,
      ),
    );

    console.log(`Seeded ${insertedPoints.length} points`);

    return {
      createTable,
      points: insertedPoints,
    };
  } catch (error) {
    console.error('Error seeding points:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await seedPoints(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
