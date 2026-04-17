const express = require("express");
const { nanoid } = require("nanoid");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3001");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Генерируем ID один раз при запуске сервера
const productIds = {
  kitten: nanoid(5),
  puppy: nanoid(5),
  fox: nanoid(5),
  bear: nanoid(5),
};

let products = [
  {
    id: productIds.kitten,
    name: "Брелок с котиком",
    category: "Украшения",
    description: "Милый брелок с подвеской в виде котика",
    price: 1999,
    count: 84,
  },
  {
    id: productIds.puppy,
    name: "Брелок с собачкой",
    category: "Украшения",
    description: "Компактный брелок с яркой эмалью",
    price: 2499,
    count: 21,
  },
  {
    id: productIds.fox,
    name: "Брелок с лисой",
    category: "Подарки",
    description: "Аккуратный аксессуар для ключей и рюкзака",
    price: 3199,
    count: 17,
  },
  {
    id: productIds.bear,
    name: "Брелок с медвежонком",
    category: "Подарки",
    description: "Мягкий брелок для подарочного набора",
    price: 4099,
    count: 9,
  },
];

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(
      `[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`
    );

    if (["POST", "PATCH", "PUT"].includes(req.method)) {
      console.log("Body:", req.body);
    }
  });

  next();
});

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Products API",
  },
  servers: [
    {
      url: `http://localhost:${port}`,
    },
  ],
  components: {
    schemas: {
      Product: {
        type: "object",
        required: ["id", "name", "category", "description", "price", "count"],
        properties: {
          id: { type: "string", example: "a1B2c" },
          name: { type: "string", example: "Брелок с котиком" },
          category: { type: "string", example: "Украшения" },
          description: {
            type: "string",
            example: "Милый брелок с подвеской в виде котика",
          },
          price: { type: "number", example: 1999 },
          count: { type: "number", example: 12 },
        },
      },
      ProductInput: {
        type: "object",
        required: ["name", "category", "description", "price", "count"],
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          description: { type: "string" },
          price: { type: "number" },
          count: { type: "number" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string", example: "Product not found" },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [__filename],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

function normalizeProductPayload(payload, partial = false) {
  const fields = ["name", "category", "description", "price", "count"];
  const normalized = {};

  for (const field of fields) {
    if (payload[field] === undefined) {
      if (!partial) {
        return { error: `Field "${field}" is required` };
      }
      continue;
    }

    if (["name", "category", "description"].includes(field)) {
      if (typeof payload[field] !== "string" || !payload[field].trim()) {
        return { error: `Field "${field}" must be a non-empty string` };
      }
      normalized[field] = payload[field].trim();
      continue;
    }

    const value = Number(payload[field]);
    if (!Number.isFinite(value) || value < 0) {
      return { error: `Field "${field}" must be a non-negative number` };
    }
    normalized[field] = value;
  }

  if (partial && !Object.keys(normalized).length) {
    return { error: "Nothing to update" };
  }

  return { data: normalized };
}

function findProductOr404(id, res) {
  const product = products.find((item) => item.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }

  return product;
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
app.get("/api/products", (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Найденный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) {
    return;
  }

  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Созданный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post("/api/products", (req, res) => {
  const { data, error } = normalizeProductPayload(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  const newProduct = {
    id: nanoid(5),
    ...data,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар частично
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Обновлённый товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Некорректные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.patch("/api/products/:id", (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) {
    return;
  }

  const { data, error } = normalizeProductPayload(req.body, true);
  if (error) {
    return res.status(400).json({ error });
  }

  Object.assign(product, data);
  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.delete("/api/products/:id", (req, res) => {
  const existingProduct = findProductOr404(req.params.id, res);
  if (!existingProduct) {
    return;
  }

  products = products.filter((item) => item.id !== req.params.id);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Swagger доступен на http://localhost:${port}/api-docs`);
});
