## Next.js App Router Course - Starter

start the app with

`yarn dev`

This is the starter template for the Next.js App Router Course. It contains the starting code for the dashboard application.

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

[DB tables constituting my schema](scripts/migrateTables.py)

To scrape and seed weekly data run

`python main.py {space seperated week numbers}`
i.e. `python main.py 5 6 7`

To drop the tables (start from scratch):
`python3 scripts/dropTables.py`
`python3 scripts/createTables.py`

To create seed users
`python3 scripts/seed_player_data.py`
This will create a user

```
noah.calvo@gmail.com password
```
