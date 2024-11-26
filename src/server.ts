import { fastifyCors } from "@fastify/cors";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { fastify } from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import { routes } from "@/routes";
import { writeFile } from "fs/promises";
import { resolve } from "node:path";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors),
  {
    origin: "*",
    credentials: true,
  };

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Typed full-stack API",
      version: "1.0.0",
      description: "A simple API using Fastify",
    },

    externalDocs: {
      url: "https://swagger.io/docs/specification/external-docs/",
      description: "Find more info here",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(routes);

app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});

app.ready().then(() => {
  const spec = app.swagger();

  writeFile(
    resolve(__dirname, "swagger.json"),
    JSON.stringify(spec, null, 2),
    "utf-8"
  );
});
