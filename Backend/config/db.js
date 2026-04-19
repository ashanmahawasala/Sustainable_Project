import mongoose from "mongoose";
import { Resolver } from "node:dns/promises";

const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/ecocycle";

const isAtlasSrvUri = (uri) => typeof uri === "string" && uri.startsWith("mongodb+srv://");

const looksLikeSrvLookupError = (error) => {
  const message = String(error?.message || "");
  // Common failures when SRV DNS lookups are blocked/refused
  return (
    message.includes("querySrv") ||
    message.includes("ENOTFOUND") ||
    message.includes("EAI_AGAIN") ||
    message.includes("ECONNREFUSED")
  );
};

const looksLikeAtlasIpWhitelistError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("whitelist") || message.includes("not whitelisted");
};

const getMongoDnsServers = () => {
  const raw = process.env.MONGO_DNS_SERVERS;
  const servers = (raw || "8.8.8.8,1.1.1.1")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return servers.length ? servers : ["8.8.8.8", "1.1.1.1"];
};

const toSearchParams = (txtRecordParts) => {
  // TXT comes as an array of string chunks; MongoDB Atlas typically returns a single querystring.
  const raw = txtRecordParts.join("");
  return new URLSearchParams(raw);
};

const sanitizeMongoUriForLog = (uri) => {
  try {
    const u = new URL(uri);
    if (u.password) u.password = "***";
    if (u.username) u.username = "***";
    return u.toString();
  } catch {
    return "(unparseable uri)";
  }
};

const buildSeedListUriFromSrv = async (mongoSrvUri) => {
  const url = new URL(mongoSrvUri);
  const host = url.hostname;
  const dbName = (url.pathname || "/").replace(/^\//, "");

  const resolver = new Resolver();
  resolver.setServers(getMongoDnsServers());

  const srvRecordName = `_mongodb._tcp.${host}`;
  const srvRecords = await resolver.resolveSrv(srvRecordName);
  if (!srvRecords?.length) {
    throw new Error("No SRV records returned for MongoDB host");
  }

  // Resolve TXT options (replicaSet, authSource, etc.)
  let txtParams = new URLSearchParams();
  try {
    const txtRecords = await resolver.resolveTxt(host);
    // dns returns e.g. [["authSource=admin&replicaSet=...&tls=true"]]
    const first = txtRecords?.[0];
    if (first?.length) txtParams = toSearchParams(first);
  } catch {
    // TXT is optional for building a working seedlist URI; ignore if unavailable.
  }

  // Merge params: keep explicit params from original URI, fill missing from TXT.
  const mergedParams = new URLSearchParams(url.searchParams);
  for (const [key, value] of txtParams.entries()) {
    if (!mergedParams.has(key)) mergedParams.set(key, value);
  }

  // Atlas requires TLS. When using mongodb+srv this is implied, but once we convert
  // to a mongodb:// seed list we must set it explicitly.
  if (!mergedParams.has("tls") && !mergedParams.has("ssl")) {
    mergedParams.set("tls", "true");
  }

  // If credentials are present, Atlas users are typically stored in the admin DB.
  if (url.username && !mergedParams.has("authSource")) {
    mergedParams.set("authSource", "admin");
  }

  // Construct host seed list
  const seeds = srvRecords
    .map((r) => ({ name: r.name?.replace(/\.$/, "") || r.name, port: r.port }))
    .filter((r) => r.name && r.port)
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));

  const hosts = seeds.map((s) => `${s.name}:${s.port}`).join(",");

  const auth = url.username
    ? `${encodeURIComponent(url.username)}:${encodeURIComponent(url.password)}@`
    : "";

  const pathPart = dbName ? `/${encodeURIComponent(dbName)}` : "/";
  const query = mergedParams.toString();
  const queryPart = query ? `?${query}` : "";

  return `mongodb://${auth}${hosts}${pathPart}${queryPart}`;
};

const connectDB = async () => {
  // Check if Mongo URI exists
  if (!process.env.MONGO_URI) {
    console.log("⚠️ No Mongo URI provided. Skipping DB connection.");
    return;
  }

  const primaryUri = process.env.MONGO_URI;

  try {
    // Attempt MongoDB connection
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (isAtlasSrvUri(primaryUri) && looksLikeSrvLookupError(error)) {
      console.warn(
        "MongoDB Atlas SRV connection failed. Trying to resolve SRV using public DNS and reconnect..."
      );

      try {
        const seedListUri = await buildSeedListUriFromSrv(primaryUri);
        const conn = await mongoose.connect(seedListUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return;
      } catch (srvConvertError) {
        console.error(
          "MongoDB SRV resolution/reconnect failed:",
          srvConvertError?.message || srvConvertError
        );
        if (looksLikeAtlasIpWhitelistError(srvConvertError)) {
          console.error(
            "Atlas blocked the connection by IP. Fix: Atlas -> Security -> Network Access -> Add IP Address (your current IP) or allow 0.0.0.0/0 for testing."
          );
        }
        console.error(
          "Original Mongo URI:",
          sanitizeMongoUriForLog(primaryUri)
        );
      }
    }

    // Last resort: try local MongoDB if installed; otherwise, keep server running without DB.
    try {
      const conn = await mongoose.connect(DEFAULT_LOCAL_MONGO_URI, {
        serverSelectionTimeoutMS: 1500,
      });
      console.log(`MongoDB Connected (local): ${conn.connection.host}`);
    } catch {
      console.warn("MongoDB not connected (cloud+local both failed). Continuing without DB.");
    }
  }
};

// Export using ES module syntax
export default connectDB;