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
      body: JSON.stringify({status:'something wrong at the top'})
    });
    return
  }

  const data = JSON.parse(event.body);
  console.log('data.address is=> '+data.address)
  const msg = {
    to: data.address,
    from: process.env.MY_EMAIL_ADDRESS,
    subject: 'Order Confirmation',
    text: data.message.replace('/n','<br>'),
    html: data.message.replace('/n','<br>'),
  };
  
  sgMail.send(msg)
  .then(()=>{
    callback(null, {
      statusCode,
      headers,
      body: JSON.stringify({status:'success'})
    });
  })
  .catch(error=>{
    callback(null, {
      statusCode,
      headers,
      body: JSON.stringify({status:error.toString()})
    });
  })
}
