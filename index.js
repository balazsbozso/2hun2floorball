const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'admin',
  password: 'xyz11BB87!',
  database: 'floorballstats'
});

app.use(express.json());

// Statikus React build
app.use(express.static(path.join(__dirname, 'client/dist')));

// ── API ────────────────────────────────────────────────────

// Szezonok listája
app.get('/api/seasons', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, year_code, name
      FROM seasons
      ORDER BY year_code DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bajnokságok egy szezonban
app.get('/api/championships', async (req, res) => {
  const { season_id } = req.query;
  if (!season_id) return res.status(400).json({ error: 'season_id kötelező' });

  try {
    const result = await pool.query(`
      SELECT id, ch_id, name, priority
      FROM championships
      WHERE season_id = $1
      ORDER BY priority ASC, name ASC
    `, [season_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tabella egy bajnoksághoz
app.get('/api/standings', async (req, res) => {
  const { championship_id } = req.query;
  if (!championship_id) return res.status(400).json({ error: 'championship_id kötelező' });

  try {
    const result = await pool.query(`
      WITH match_results AS (
        SELECT
          m.id,
          m.home_team_id AS team_id,
          m.home_score AS scored,
          m.away_score AS conceded,
          CASE
            WHEN m.home_score > m.away_score THEN 'W'
            WHEN m.home_score < m.away_score THEN 'L'
            ELSE 'D'
          END AS result
        FROM matches m
        WHERE m.championship_id = $1 AND m.is_finished = TRUE

        UNION ALL

        SELECT
          m.id,
          m.away_team_id AS team_id,
          m.away_score AS scored,
          m.home_score AS conceded,
          CASE
            WHEN m.away_score > m.home_score THEN 'W'
            WHEN m.away_score < m.home_score THEN 'L'
            ELSE 'D'
          END AS result
        FROM matches m
        WHERE m.championship_id = $1 AND m.is_finished = TRUE
      )
      SELECT
        t.name AS team,
        COUNT(*) AS played,
        COUNT(*) FILTER (WHERE result = 'W') AS won,
        COUNT(*) FILTER (WHERE result = 'D') AS drawn,
        COUNT(*) FILTER (WHERE result = 'L') AS lost,
        SUM(scored) AS goals_for,
        SUM(conceded) AS goals_against,
        SUM(scored) - SUM(conceded) AS goal_diff,
        COUNT(*) FILTER (WHERE result = 'W') * 3 +
        COUNT(*) FILTER (WHERE result = 'D') * 1 AS points
      FROM match_results mr
      JOIN teams t ON t.id = mr.team_id
      GROUP BY t.id, t.name
      ORDER BY points DESC, goal_diff DESC, goals_for DESC
    `, [championship_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Meccsek egy bajnokságban
app.get('/api/matches', async (req, res) => {
  const { championship_id } = req.query;
  if (!championship_id) return res.status(400).json({ error: 'championship_id kötelező' });

  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.match_id,
        m.match_date,
        m.match_time,
        m.round,
        ht.name AS home_team,
        at.name AS away_team,
        m.home_score,
        m.away_score,
        m.is_finished
      FROM matches m
      JOIN teams ht ON ht.id = m.home_team_id
      JOIN teams at ON at.id = m.away_team_id
      WHERE m.championship_id = $1
      ORDER BY
        m.is_finished ASC,
        CASE WHEN m.is_finished = FALSE THEN m.match_date END ASC NULLS LAST,
        CASE WHEN m.is_finished = TRUE  THEN m.match_date END DESC NULLS LAST,
        m.round ASC NULLS LAST
    `, [championship_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React SPA fallback
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Szerver fut a ${PORT}-es porton`);
});