import {
  addMeasurment,
  addWeight,
  getAllMeasurments,
  getAllWeights,
  WeightPayload,
} from "$db";
import { config } from "dotenv";

type TemperaturePayload = {
  tempCelsius: number;
  locationName: string;
};

config();

type GenerateResponseArgs = {
  status: number;
  body?: any;
};

const generateResponse = ({ status, body }: GenerateResponseArgs) => {
  const response = Response.json(body, { status });
  response.headers.set("Access-Control-Allow-Origin", "http://jack-serv.local");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  return response;
};

const server = Bun.serve({
  port: 3333,
  async fetch(request) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/temperature": {
        if (request.method === "POST") {
          const payload = (await request.json()) as TemperaturePayload;

          await addMeasurment(payload);

          return generateResponse({ status: 204 });
        }

        if (request.method === "GET") {
          const measurements = await getAllMeasurments();

          return generateResponse({ status: 200, body: measurements });
        }

        return generateResponse({
          status: 405,
          body: { message: "Endpoint does not support method" },
        });
      }

      case "/weight": {
        if (request.method === "POST") {
          const payload = (await request.json()) as WeightPayload;

          await addWeight(payload);

          return generateResponse({ status: 204 });
        }

        if (request.method === "GET") {
          const weights = await getAllWeights();

          return generateResponse({ status: 200, body: weights });
        }
      }

      default: {
        return generateResponse({
          status: 404,
          body: { messaage: `Endpoint '${url.pathname}' is not supported` },
        });
      }
    }
  },
});

console.log(`Server listening on port ${server.port}`);
