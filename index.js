//const process = require('dotenv').config(); --> note to future claire :: you will have to fix this later !
const server = require('./api/server.js');

const PORT = 9000;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
