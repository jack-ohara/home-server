import { readFile } from "fs/promises";
import { createConnection } from "mysql2/promise";

export type Measurment = {
  locationName: string;
  tempCelsius: Number;
};

async function getConnection() {
  const password = await readFile(process.env.DB_PASSWORD_FILE!);
  console.log({ password: password.toString() });
  return await createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: password.toString(),
  });
}

export async function addMeasurment({ locationName, tempCelsius }: Measurment) {
  const connection = await getConnection();

  await connection.execute(
    "INSERT INTO `home-data`.`temperature-readings`" +
      "(`location-id`, `timestamp`, `temp-celsius`) " +
      "VALUES (" +
      "(SELECT id FROM `home-data`.locations WHERE `name` = ?)," +
      "NOW()," +
      "?" +
      ")",
    [locationName, tempCelsius]
  );
}

export async function getAllMeasurments() {
  const connection = await getConnection();

  const [rows] = await connection.execute(
    "SELECT * FROM `home-data`.`temperature-readings` ORDER BY timestamp"
  );

  return rows as Measurment[];
}
