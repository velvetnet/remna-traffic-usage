require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.APPLICATION_PORT || 3000;

// Basic Auth middleware
const basicAuth = (req, res, next) => {
  const authUser = process.env.BASIC_AUTH_USER;
  const authPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!authUser || !authPassword) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Remna Traffic Usage"');
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  if (username === authUser && password === authPassword) {
    return next();
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="Remna Traffic Usage"');
  return res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  });
};

app.use(basicAuth);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

app.get('/', async (req, res) => {
  try {
    const nodesParam = req.query.nodes;

    if (!nodesParam) {
      return res.status(400).json({
        success: false,
        error: 'Parameter "nodes" is required'
      });
    }

    const nodeUuids = nodesParam.split(',').map(uuid => uuid.trim());

    if (nodeUuids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one node UUID is required'
      });
    }

    const placeholders = nodeUuids.map((_, i) => `$${i + 1}`).join(',');

    const result = await pool.query(
      `
        WITH expensive_nodes AS (
          SELECT uuid
          FROM nodes
          WHERE uuid IN (${placeholders})
        )
        SELECT
          u.uuid as user_uuid,
          u.username,
          SUM(nuh.total_bytes) as paid_traffic
        FROM nodes_user_usage_history nuh
        INNER JOIN expensive_nodes en ON nuh.node_uuid = en.uuid
        INNER JOIN users u ON nuh.user_uuid = u.uuid
        WHERE nuh.created_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND nuh.created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        GROUP BY u.uuid, u.username
        HAVING SUM(nuh.total_bytes) > 0
        ORDER BY paid_traffic DESC;
      `,
      nodeUuids
    );
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
