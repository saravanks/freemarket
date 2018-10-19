const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const statusCode = 200;
const headers = {
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Headers": "Content-Type"
};



exports.handler = function(event, context, callback) {
  if(event.httpMethod !== 'POST' || !event.body) {
    callback(null, {
      statusCode,
      headers,
      body: 'something wrong at the top'
    });
  }

  const data = JSON.parse(event.body);

  const msg = {
    to: data.address,
    from: process.env.MY_EMAIL_ADDRESS,
    subject: 'Order Confirmation',
    text: 'test',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  };
  

  sgMail.send(msg)
  .then(()=>{
    callback(null, {
      statusCode,
      headers,
      body: 'success'
    });
  })
  .catch(error=>{
    callback(null, {
      statusCode,
      headers,
      body: error.toString()
    });
  })
}
