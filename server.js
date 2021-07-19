const express = require("express");
const fastify = require("fastify")({ logger: true });
const { createProxyMiddleware } = require("http-proxy-middleware");
const dotenv = require("dotenv");

dotenv.config();

const proxyConfig = {
  target: process.env.API_DOMAIN,
  prependPath: true,
  changeOrigin: true,
  pathRewrite: {
    "^/api": "/",
  },
  onProxyReq: (proxyReq, req, res) => {
    proxyReq.setHeader("X-TYPESENSE-API-KEY", process.env.TYPESENSE_KEY);
  },
};

const port = process.env.PORT || 3000;

// IIFE to allow async / await syntax
(async () => {
  try {
    // Load libs
    await fastify.register(require("fastify-express"));
    await fastify.register(require("fastify-cors"));

    // All routes starting with /api have this proxy middleware applied
    fastify.use(createProxyMiddleware("/api", proxyConfig));

    fastify.listen(port, (err) => {
      if (err) {
        throw err;
      }
      console.log(`> Ready on port: ${port}`);
    });
  } catch (err) {
    console.log("An error occurred, unable to start the server");
    console.log(err);
  }
})();
