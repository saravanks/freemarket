const UN = process.env.GITHUB_USERNAME
const UP = process.env.GITHUB_PASSWORD

var request = require('request');

function calculateNewInventory(inventory,cart){
  var optionizedCart = cart.map(cartItem=>{
    const {trackOptions=false,options=[],selected='',title='',quantity=0} = cartItem
    console.log(JSON.stringify(cartItem))
    if(trackOptions && options.length>0){
      return {
        options:options,
        selected:selected, 
        title: title + '(' + selected + ')',
        quantity:quantity
      }
    }else{
      return cartItem
    }
  })
  var newInventory=inventory.slice()
  for(let cartItem of optionizedCart){
    newInventory=newInventory.map(item=>{
      if(item.title==cartItem.title){
        return {
          title:item.title,
          value:item.value-cartItem.quantity
          }
      }else{
        return item
      }
    })
  }
  return newInventory
}

exports.handler = function(event, context, callback) {
  var cart = JSON.parse(event.body)
  getInventory(cart)
}

function getInventory(cart){
  console.log('running')
  var getOptions = {
    //this address is wrong now
      url: `https://api.github.com/repos/${UN}/freemarket/contents/content/inventory/inventory.json`,
      auth: {
          "user": UN,
          "pass": UP,
      },
      headers: {
        'User-Agent': 'request'
      }
  };

  function getCallback(error, response, body) {
    const data = JSON.parse(body)
    var sha = data.sha
    var buf = new Buffer(data.content, 'base64').toString();
    var inventory = JSON.parse(buf)
    // inventory.inventory ????
    var newInventory = calculateNewInventory(inventory.inventory,cart)
    setInventory(sha,newInventory)
  }
  request(getOptions, getCallback);
}

function setInventory(sha,newInventory){

  var newFileContent = new Buffer(JSON.stringify({inventory:newInventory})).toString("base64");

  var options = {
    url: `https://api.github.com/repos/${UN}/freemarket/contents/content/inventory/inventory.json`,
    auth: {
        "user": UN,
        "pass": UP
    },
    headers: {
      'User-Agent': 'request'
    },
    method:"PUT",
    body:JSON.stringify({
      "message":"update_inventory",
      "content":newFileContent,
      "sha":sha,
      "committer": {
        "name":UN,
        "email":'freemarket@internet.org'
      }
    })
  };

  function callback(error, response, body) {
    // console.log("response=> " + JSON.stringify(response))
    // console.log("body=> ") + body
    // console.log("error=> " + error)
  }
  request(options, callback);
}
