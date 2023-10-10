import { addMeasurment, getAllMeasurments } from "$db";

type TemperaturePayload = {
  tempCelsius: number;
  locationName: string;
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

          return new Response(undefined, { status: 204 });
        }

        if (request.method === "GET") {
          const measurements = await getAllMeasurments();
          return Response.json({}, { status: 200 });
        }

        return Response.json(
          { message: "Endpoint does not support method" },
          { status: 405 }
        );
      }

      default: {
        return Response.json(
          { messaage: `Endpoint '${url.pathname}' is not supported` },
          { status: 404 }
        );
      }
    }
  },
});

console.log(`Server listening on port ${server.port}`);
