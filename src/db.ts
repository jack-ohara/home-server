import { readFile } from "fs/promises";
import { createConnection } from "mysql2/promise";

export type Measurment = {
  locationName: string;
  tempCelsius: Number;
};

async function getConnection() {
  try {
    const password = await readFile(process.env.DB_PASSWORD_FILE!);
    const connectionOptions = {
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: password.toString(),
    };

    return await createConnection(connectionOptions);
  } catch (e) {
    console.error({ error: e });
    throw e;
  }
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
    "SELECT * FROM `home-data`.`temperature-readings` ORDER BY timestamp DESC"
  );

  return rows as Measurment[];
}
