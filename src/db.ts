import { Collection, Document, MongoClient } from "mongodb";

export type Measurment = {
  locationName: string;
  tempCelsius: Number;
};

export type WeightPayload = {
  weightKg: number;
  date: Date;
  name: string;
};

type CollectionName = "temp-readings" | "weights";

async function executeInDb<TResult>(
  callback: (collection: Collection<Document>) => Promise<TResult>,
  collectionName: CollectionName,
  dbName = "home-data"
) {
  const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await callback(collection);
    return result;
  } finally {
    await client.close();
  }
}

export async function addMeasurment({ locationName, tempCelsius }: Measurment) {
  const result = await executeInDb(async (collection) => {
    const document = {
      metadata: {
        location: locationName,
      },
      timestamp: new Date(),
      tempCelsius,
    };

    return await collection.insertOne(document);
  }, "temp-readings");

  console.log(`Inserted temp reading into db: ${JSON.stringify(result)}`);
}

export async function getAllMeasurments() {
  return executeInDb(async (collection) => {
    return collection.find().toArray();
  }, "temp-readings") as unknown as Measurment[];
}

export async function addWeight({ weightKg, date, name }: WeightPayload) {
  const result = await executeInDb(async (collection) => {
    const document = {
      metadata: {
        name,
      },
      weightKg,
      date,
    };

    return await collection.insertOne(document);
  }, "weights");

  console.log(`Inserted weight into db: ${JSON.stringify(result)}`);
}

export async function getAllWeights() {
  return executeInDb(async (collection) => {
    return collection.find().toArray();
  }, "weights") as Promise<any[]>;
}
