const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('views', process.cwd());
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) => {
  res.render('index.html', {
    process: { env: process.env },
  });
});

app.use(express.static(__dirname));

// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`listening on port ${PORT}`));

app.use(function(req, res, next) {
  res.status(404).send("Sorry can't find that!");
});
