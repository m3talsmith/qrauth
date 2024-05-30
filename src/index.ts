import bodyParser from 'body-parser';
import express from 'express';
import { authenticatedHandler, authenticateHandler, preauthHandler } from './authentication';

const app = express();
const port = 3000;
const jsonParser = bodyParser.json();

app.get('/api/preauth', preauthHandler);
app.get('/api/authenticated/:challenge', authenticatedHandler);
app.post('/api/authenticate/:challenge', jsonParser, authenticateHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});