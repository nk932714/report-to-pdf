let express = require('express');
let cors = require('cors');

let app = express();

app.use(express.json());
app.use(cors());

let generate_uuid = () => {
  let S4 = () => {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

let cache = {};
let options_cache = {};

app.get('/html.pdf', async (req, res) => {

  try {
    if (process.env.NODE_ENV === 'development') {
      delete require.cache[require.resolve('./render_pdf.js')];
    }

    req.body = options_cache[req.query.id];
    delete options_cache[req.query.id];

    let { render_response } = require('./render_pdf.js');
    await render_response(req, res, cache);
  } catch (require_error) {
    console.error(`Error during \`require('./render_pdf.js')\``);
    console.error(require_error);
  }

  //
  // try {
  //   delete require.cache[require.resolve('./render_pdf.js')]
  //   let { render_pdf } = require('./render_pdf.js');
  //   res.end(await render_pdf(`
  //     <div>Sorry, you need to do a POST request to make this work</div>
  //   `, { /* default options */ }, cache));
  // } catch (require_error) {
  //   console.error(`Error during \`require('./render_pdf.js')\``);
  //   console.error(require_error);
  // }

})

app.post('/request_pdf_path', async (req, res) => {
  let body = req.body;
  let uuid = generate_uuid();
  options_cache[uuid] = req.body;

  res.end(JSON.stringify({
    pdf_path: `/html.pdf?id=${uuid}`,
  }));
})

app.listen(process.env.PORT || 5000, () => {
  console.log('Listening on port 5000');
  console.log();
});

process.on('SIGINT', () => {
  process.exit();
});
