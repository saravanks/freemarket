import React from 'react'
import { observer } from 'mobx-react';
import { slugify } from '../util/url'
import uuid from 'uuid/v4'
import StripeCheckout from "react-stripe-checkout"
import Select from '../components/Select.js'
import State from './state'
import data from '../data.json'
import './Checkout.css'
import Link from '../components/Link'
import {PUBLIC_KEY} from '../PUBLIC_KEY.js'

const l = x =>console.log(x)

const formfields = ['Name','Street Address','City', 'State/Province','ZIP code / Postal Code', 'Country']
var purchaseDataString = ''

const onCompletePayment = () =>{
  State.setTransactionComplete(1)
  State.reset()
}

const sendEmail = address =>{
  fetch("/.netlify/functions/sendgrid", {
    method: "POST",
    body: JSON.stringify({address})
  })
  .then(r=>r.json()).then(j=>{
    const data = JSON.parse(j)
    if(data.body!='success'){
      console.error(data.body)
    }
  })
}

const freeShipping=()=>{
  const freeShippingObject = data.regionsAndCarriers.filter(x=>x.name=='settings')[0]
  // if user hasnt set this up right, or at all
  if(freeShippingObject.freeShipping==undefined ||
     freeShippingObject.above==undefined ||
     // or if they have set it up to be disabled
     (freeShippingObject.freeShipping && freeShippingObject.freeShipping==false)){
    return false
  }
  return getSubtotal() > freeShippingObject.above
}

const encodeData=token=>{
  const relevantFieldsFromItem = ['title','quantity','price','options']
  const purchaseInfo    = '\npurchases: ' + State.cart.map((item,i)=>`\n\n#${i+1} :` + relevantFieldsFromItem.map(field=>`\n${field}:${item[field]}`))
  const userDataStrings = Object.keys(State.fields).map(name=>`${name} : ${State.fields[name]}`)
  const cartInfo = `
subtotal : $${(getSubtotal()).toFixed(2)}
shipping : $${(getHighestShippingCost()).toFixed(2)}
tax : $${((getSubtotal()+getHighestShippingCost())*0.15).toFixed(2)}
total : $${((getSubtotal()+getHighestShippingCost())*1.15).toFixed(2)}
date : ${Date()}
  `
  const userData = userDataStrings.join('\n')
  const tokenString = JSON.stringify(token||'',null,3).replace(/[^\w\s:_@.-]/g,'')
  purchaseDataString = `
${userData}
${purchaseInfo}
${cartInfo}

stripe payment meta-data:
${tokenString}`
  return purchaseDataString
}

const reportCartToInventory=()=>{
  fetch("/.netlify/functions/stock", {
    method: "POST",
    body: JSON.stringify(State.getCart())
  })
}

const onToken = token => {
  const data = {
    token,
    amount: Math.ceil((getSubtotal()+getHighestShippingCost())*1.15*100),
    idempotency_key:uuid(),
  }
  fetch("/.netlify/functions/purchase", {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(r=>r.json()).then(data=>{
    if(data.status=='succeeded'){
      console.log(`payment was successful`);
      // call stock.js
      reportCartToInventory()
      // invoke form submit
      submit(encodeData(token))
      // invoke sendGrid
      sendEmail(token.email)
      console.log('email on token=> '+token.email)
      // update UI to thanks message
      onCompletePayment()
    }else{
      console.log(data.status,data.err)
    }
  })
  .catch(error=>console.log(error.toString()))
  // .then(response => {
  //   response.json().then(data => {
  //     if(data.status=='succeeded'){
  //       console.log(`payment was successful`);
  //       fetch("/.netlify/functions/stock", {
  //         method: "POST",
  //         body: JSON.stringify(State.getCart())
  //       })
  //       submit(encodeData(token))
  //     }
  //   });
  // });
}
const encode = (data) => {
  return Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join("&");
}
const submit = (data) => {
  fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: encode({ "form-name": "purchase", "data":data })
  })
    .then(() =>{
      alert("form submit Success!")
    })
    .catch(error => alert(error));
};

const getRegions = () =>{
  var regions = new Set()
  State.getCart().forEach(item=>{
    const shippingClass = data.shipping.filter(c=>c.title==item.class)[0]
    shippingClass && shippingClass.carriers.forEach(carrier=>{
      carrier.regions.forEach(region=>{
        regions.add(region.title)
      })
    })
  })
  return Array.from(regions)
}

// const getCarriers = region => {
//   // console.log('region: ' + region)
//   var carriers = {}
//   State.getCart().forEach(item=>{
//     const shippingClass = data.shipping.filter(c=>c.title==item.class)[0]
//     shippingClass && shippingClass.carriers.forEach(carrier=>{
//       if(carrier.regions.filter(r=>r.title==State.getRegion()).length>0){
//         carriers[carrier.title] = carrier.regions.filter(r=>r.title==State.getRegion())[0].cost
//       }
//     })
//   })
//   return Object.keys(carriers)
// }

const getCarriers = () =>{
  const currentRegion = State.getRegion()
  l(`in region ${currentRegion}`)
  // untested
  var carriersNames = data.regionsAndCarriers.filter(x=>x.name=='carriers').length!=0 && 
                      data.regionsAndCarriers.filter(x=>x.name=='carriers')[0].carriers ?
                      data.regionsAndCarriers.filter(x=>x.name=='carriers')[0].carriers.map(x=>x.title) :
                      []
  l(`available carriers are : ${carriersNames}`)
  var classesInCartSet = new Set([])
  State.getCart().forEach(item=>{
    classesInCartSet.add(item.class)
  })
  var classesInCart = Array.from(classesInCartSet)
  l(`the classes in the cart are : ${classesInCart}`)
  // console.log('classesInCart=>  '+classesInCart)
  var commonCarriersNames = []
  carriersNames.forEach(name=>{
    // only add carriers that are supported, in that region, by ALL of the classes in the cart
    l(`carrier ${name}`)
    if(classesInCart.every(c=>{
      const classObject = data.shipping.filter(x=>x.title==c)[0]
      // console.log('classObject=>'+JSON.stringify(classObject))
      const classRegions = classObject.carriers.filter(x=>x.title==name)[0].regions
      l(`ships to these regions : ${classRegions.map(r=>r.title)}`)
      return classRegions.filter(r=>r.title==currentRegion).length>0
    })){
      commonCarriersNames.push(name)
    }
  })
  // console.log('commonCarrieraNames=>'+commonCarriersNames)
  l(`so the carriers which ship to this region, for all classes in the cart are : ${commonCarriersNames}`)
  return commonCarriersNames
}

const getTotalWeight = () => {
  var weight = 0
  State.getCart().forEach(item=>{
    l(`item ${item.title} weighs ${item.weight} and there are ${item.quantity} in the cart`)
    weight += item.weight * item.quantity
  })
  l(`so the total weight is ${weight}`)
  return weight
}

const getHighestShippingCost = () =>{
  if(freeShipping()){return 0}
  var highestShippingCost = 0
  if(State.getCart().length<1   ){return 0}
  if(State.getCarrier() == ' '  ){return 0}
  if(State.getRegion()   == ' ' ){return 0}
  var classesInCart = new Set([])
  State.getCart().forEach(item=>{
    classesInCart.add(item.class)
  })
  l(`in calculating the shipping cost, these classes are in the cart : ${Array.from(classesInCart)}`)
  Array.from(classesInCart).forEach(classTitle=>{
    const shippingClass = data.shipping.filter(c=>c.title==classTitle)[0]
    const haveCarrier = shippingClass.carriers.filter(c=>c.title==State.getCarrier()).length>0
    if(!haveCarrier){return}
    const carrier = shippingClass.carriers.filter(c=>c.title==State.getCarrier())[0]
    const region = carrier.regions.filter(r=>r.title==State.getRegion())[0]
    const weight = getTotalWeight()
    // if the perKg field is empty assume its 0
    if(region.perKg==undefined){region.perKg==0}
    const cost = (parseFloat(region.perKg) * weight) + parseFloat(region.cost)
    // console.log('cost=>' + cost)
    l(`with class ${classTitle}, and carrier ${carrier.title},in region ${region.title}, with a base-fee of $${region.cost}, and with total weight : ${weight}, and $${region.perKg}/Kg, the shipping would be ${cost}`)
    // const cost = region ? region.cost : 0
    if(cost>highestShippingCost){
      highestShippingCost=cost
    }
  })
  l(`so the highest option is ${highestShippingCost}`)
  return highestShippingCost
}

const getSubtotal=()=>{
  var cartTotal = 0
  State.getCart().forEach(item=>{
    var price = parseFloat(item.price)
    // ** now doing this in the product page **
    // if(item.selected!=''){
    //   const opt = item.options.filter(o=>o.title==item.selected)[0]
    //   if(opt.cost){
    //     price += parseFloat(opt.cost)
    //   }
    // }
    cartTotal += (price * parseFloat(item.quantity))
  })
  return cartTotal
}

const validateFields=()=> 
  State.getCarrier()!=' ' && 
  formfields.every(f=> State.getField(slugify(f)) != false)

class Checkout extends React.Component {
  componentDidMount(){
    State.setSelection(' ')
    State.setCarrier(' ')
    State.setRegion(' ')
  }
  render(){
    const chargeTax = data.regionsAndCarriers.filter(x=>x.name=='settings')[0].chargeTax
    const taxRatePercent =  data.regionsAndCarriers.filter(x=>x.name=='settings').length &&
                            data.regionsAndCarriers.filter(x=>x.name=='settings')[0].chargeTax &&
                            data.regionsAndCarriers.filter(x=>x.name=='settings')[0].taxRate ?
                            data.regionsAndCarriers.filter(x=>x.name=='settings')[0].taxRate :
                            0
    const taxRate = taxRatePercent/100
    if(State.getTransactionComplete()==0)
      {
        // State.setSelection(' ')
        // State.setCarrier(' ')
        // State.setRegion(' ')
      return(
      <div className='checkout-container'>
        <p>Please enter your shipping info:</p>
        <form name='purchase'>
          <div className='Checkout-Region-Dropdown'>
            <Select
              ref={i=>this.regionDropdown=i}
              title={State.getRegion()==' ' ? 'Please Select Region :' : State.getRegion()}
              options={getRegions().map(r=>({label:r,value:r}))}
              onChange={(e)=>{
                this.shippingDropdown.reset()
                State.setRegion(e.label);
                State.setCarriers(getCarriers(e.label))
                State.setCarrier(' ')
                // encodeData()
                console.log('from region change=>')
                console.log(State.getCarrier())
              }}
            />
          </div>
          {formfields.map((field,index)=>{
            const slug = slugify(field)
            return(
              <div key={index}>
                <input
                  key={index}
                  placeholder={field}
                  name={slug} 
                  value={State.getField(slug) || ''} 
                  onChange={(e)=>State.setField(e.target.name,e.target.value)}
                />
              </div>
          )})}
          <div className='Checkout-Shipping-Dropdown'>
            <Select 
              ref={i=>this.shippingDropdown=i}
              title={State.getCarrier()==' ' ? 'Please Select Shipping :' : State.getCarrier()}
              options={
                freeShipping() ? 
                [{label:'Free Shipping', value:0}] :
                State.getCarriers().map(c=>({label:c,value:c}))}
              onChange={(e)=>{
                if(e!=null){
                  State.setCarrier(e.label);
                  encodeData()
                  console.log('from carrier change=>')
                  console.log(State.getCarrier())
                }
                console.log('from carrier change (with null)=>')
                console.log(State.getCarrier())

              }}
            />
          </div>
        </form>
        <div className="Checkout-Register" style={{width:'250px'}}>
          {/* <p className="Checkout-Text">{"subtotal : $" + (getSubtotal()).toFixed(2)}</p>
          <p className="Checkout-Text">{"shipping : $" + (getHighestShippingCost()).toFixed(2)}</p> */}
          {/* <p className="Checkout-Text">{"taxes    : $" + ((getSubtotal()+getHighestShippingCost())*(taxRate)).toFixed(2)}</p> */}
          <table style={{width:'100%'}}>
            <tr style={{width:'100%'}}>
              <td style={{width:'100%'}}>
                <span className="Checkout-Table" style={{float:"left"}}>subtotal</span>
                <span className="Checkout-Table" style={{float:"right"}}>{"$" + (getSubtotal()).toFixed(2)}</span>
              </td>
            </tr>
            <tr style={{width:'100%'}}>
              <td style={{width:'100%'}}>
                <span className="Checkout-Table" style={{float:"left"}}>shipping</span>
                <span className="Checkout-Table" style={{float:"right"}}>{"$" + (getHighestShippingCost()).toFixed(2)}</span>
              </td>              
            </tr>
          {chargeTax &&
            <tr style={{width:'100%'}}>
              <td style={{width:'100%'}}>
                <span className="Checkout-Table" style={{float:"left"}}>taxes</span>
                <span className="Checkout-Table" style={{float:"right"}}>{"$" + ((getSubtotal()+getHighestShippingCost())*(taxRate)).toFixed(2)}</span>
              </td>              
            </tr>
          }
            <tr style={{width:'100%'}}>
              <td style={{width:'100%'}}>
                <span className="Checkout-Table" style={{float:"left"}}>total</span>
                <span className="Checkout-Table" style={{float:"right"}}>{"$" + ((getSubtotal()+getHighestShippingCost())*(taxRate+1)).toFixed(2)}</span>
              </td>              
            </tr>
          
          {/* <tr><td style={{position:'relative`'}}>
            <div style={{position:'absolute',textAlign:'left'}}>{"subtotal"}</div>
            <div style={{position:'absolute',textAlign:'right'}}>{"$" + (getSubtotal()).toFixed(2)}</div>
          </td></tr>
          <td style={{position:'relative`'}}>
            <div  style={{position:'absolute',textAlign:'left'}}>{"total test"}</div>
            <div  style={{position:'absolute',textAlign:'right'}}>{"total test"}</div>
          </td>
          <td style={{position:'relative`'}}>
            <div  style={{position:'absolute',textAlign:'left'}}>{"total test"}</div>
            <div  style={{position:'absolute',textAlign:'right'}}>{"total test"}</div>
          </td> */}
          </table>
          {/* <p className="Checkout-Text">{"total    : $" + ((getSubtotal()+getHighestShippingCost())*(taxRate+1)).toFixed(2)}</p> */}
        </div>
        <div 
          style={{height:'30px',width:'200px',}}
          onClick={()=>sendEmail()}  
        >
          email
        </div>
        <div className="Checkout-Stripe-Container">
          <div 
            className='Checkout-Stripe-Blocker'
            style={{height: validateFields() ? '1px' : '60px'}}
            onClick={(e)=>{
              e.preventDefault()
              alert('Please Fill Out All The Fields')
            }}
          />
          <div style={{filter:'grayscale(80%)'}}>
            <StripeCheckout 
              style={{width:'250px',margin:'0px'}}
              token={onToken} 
              stripeKey={PUBLIC_KEY}
            />
          </div>
        </div>
      </div>
      )
    }
    else
    {
      return(
        <div>
        <div>thanks very much for your order, your details are below</div>
        <div>{purchaseDataString}</div>
        <Link to='/store'><div onClick={()=>State.setTransactionComplete(0)} className='Checkout-Back'> Return to Shop </div></Link>
        </div>
      )
    }
  }
}

export default observer(Checkout)