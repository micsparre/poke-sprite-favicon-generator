import express from 'express';
import cors from 'cors';
import { pokemonRouter } from './routes/pokemon.js';
import { faviconRouter } from './routes/favicon.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/pokemon', pokemonRouter);
app.use('/api/favicon', faviconRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
