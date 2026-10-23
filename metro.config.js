
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

if (!config.resolver.assetExts.includes("html")) {
  config.resolver.assetExts.push("html");
}

if (!config.resolver.assetExts.includes("wasm")) {
  config.resolver.assetExts.push("wasm");
}

const previousEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, server) => {
  const enhancedMiddleware = previousEnhanceMiddleware
    ? previousEnhanceMiddleware(middleware, server)
    : middleware;

  return (request, response, next) => {
    response.setHeader(
      "Cross-Origin-Embedder-Policy",
      "credentialless",
    );
    response.setHeader(
      "Cross-Origin-Opener-Policy",
      "same-origin",
    );

    enhancedMiddleware(request, response, next);
  };
};

module.exports = config;
