const Clear = require('./../Services/ClearService');

exports.syncClear = (req, res) => {
  const params = req.body;

  return new Promise((resolve, reject) => {
    Clear.get({
      headless: false,
      cached: params.cached ,
      credentials: params.credentials
    }).then((result)=>{
        res.status(200).send(result);
        resolve(1);
    });
  });
}