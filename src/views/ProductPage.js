import React from 'react'
import State from './state'
import ReactMarkdown from 'react-markdown'
import Link from '../components/Link'
import Select from '../components/Select'
import Gallery from '../components/Gallery'
import { observer } from 'mobx-react';
import data from '../data.json'

import './ProductPage.css'

const toDollars = x => parseFloat(x).toFixed(2)

const getSmallImages = (images) => {
  var smallImages = []
  images.forEach(image=>{
    var img = image.image.split('/')[image.image.split('/').length-1]
    var name = img.substring(0, img.lastIndexOf("."));
    var extension = img.substring(img.lastIndexOf(".") + 1, img.length);  
    const path = '/images/uploads/resized/' + name + '.600.' + extension
    smallImages.push({...image,image:path})
  })
  return smallImages
}

// const isAlreadyInCart = title =>{
//   const selected = State.getSelection()
//   const cart = State.getCart()
//   var isInCart = false
//   cart.forEach(item=>{
//     if(item.title==title && item.selected==selected){
//       isInCart = true
//     }
//   })
//   return isInCart
// }
const isAlreadyInCart = title => State.getCart().some(x=>x.title==title && x.selected==State.getSelection())

const getCost = (price,options,selection) =>{
  if(options.filter(o=>o.title==selection).length>0){
    return parseFloat(price) + parseFloat(options.filter(o=>o.title==selection)[0].cost)
  }
  return price
}

const soldOutOption = (p,o) => {
  if(data.inventory && data.inventory.length && data.inventory[0].inventory){
    // we have a listing in inventory for it
    return data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p+'('+o+')').length>0 &&
    // is it sold out?
    data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p+'('+o+')')[0].value<1
  }else{
    console.log('couldnt find the inventory list something is wrong with your inventory')
    return true
  }
}
const soldOut = p => 
  // do we track this products stock?
  data.products.filter(x=>x.title==p)[0].trackInventory &&
  // do we have a listing for it in inventory file?
  data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p).length>0 &&
  // is it sold out?
  data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p)[0].value<1

const noSelectionMade=options=> options.length>0 && State.getSelection() == ''

const soldOutViaOtherOptions = item =>{
  const {trackInventory,trackOptions,options, title} = item
  // if we dont track it, it cant be sold out
  if(!trackInventory && (!trackOptions || options.length<1)){return false}
  const inCart = State.getQuantityOfItemInCart(item)
  console.log('inCart: '+inCart)
  var stock = 0
  // if this item stocks alone
  if(trackInventory && (!trackOptions || options.length<1)){
    // if we can find an entry for it in inventory
    if(data.inventory && data.inventory.length && data.inventory[0].inventory && data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==title).length>0){
      //set stock to that
      stock = data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==title)[0].value
    }
    // if the item tracks as its options
  } else if(trackInventory && options.length>0){
    const stockName = `${title}(${State.getSelection()})`
    // if we can find an entry for it in inventory
    if(data.inventory && data.inventory.length && data.inventory[0].inventory && data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==stockName).length>0){
      //set stock to that
      stock = data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==stockName)[0].value
    }
  }
  return inCart >= stock
}


class ProductPage extends React.Component{
  constructor(props){
    super(props)
    this.state={
      cost:props.fields.price,
      soldOut:false
    }
  }
  componentDidMount(){
    const {title='',options=[],trackInventory=false,trackOptions=false}=this.props.fields
    // if we track this item as itself
    if(trackInventory && (!trackOptions || options.length==0)){
      this.setState({soldOut:soldOut(title)})
    // if we track its options, it's sold out only if all are sold out
    }else if(trackOptions && options.length>0){
      this.setState({soldOut:options.every(o=>soldOutOption(title,o.title))})
      // const itemsTrackedSoldOut = []
      // if(trackInventory){itemsTrackedSoldOut.push(soldOut(title))}
      // options.forEach(o=>{
      //   if(o.separateStock){itemsTrackedSoldOut.push(soldOutOption(title,o.title))}
      // })
      // this.setState({soldOut:itemsTrackedSoldOut.every(i=>i)})
    }
    // if(soldOut(title) && options.every(o=>soldOutOption(title,o.title))){
    //   this.setState({soldOut:true})
    // }
    State.setSelection('')

  }
  render(){
    const { trackInventory, trackOptions, title, price, longDescription, images, options=[] } = this.props.fields
      // if(State.getSelection()!=' ' && data.products.filter(x=>x.title==title)[0].options.filter(x=>x.title==State.getSelection())[0].separateStock){
        // return data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==title+'('+State.getSelection()+')')[0].value<1
      // }else{
        // return  data.products.filter(x=>x.title==title)[0].trackInventory &&
                // data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==title)[0].value<1
    //   }
    // }
    return (
      <div className="Product-Page-Wrapper">
        <div className="Product-Page-Container">
          <div className="Product-Page-Product">
            <Gallery imageList={getSmallImages(images)}/>
            <div className="Product-bar">
              <div className="Product-name">{title || ''}</div>
              <div className="Product-price">${toDollars(this.state.cost)}</div>
            </div>
            {options && options.length>0 &&
              <Select
                title='Please Select :'
                options={[...options.map(o=>({
                  // ({label:( o.cost==0 || o.cost=='') ? 
                  //           o.title :
                  //           `${o.title}  (+ $${o.cost})`,
                  //   value:o.title
                  // }))
                  label:o.title,
                  value:o.title,
                  cost:toDollars(o.cost)
                }))
                ]}
                onChange={(selection)=>{
                  // if this new selection gets stock tracked separately
                  if(trackOptions && options.length>0){
                  // setState to if its sold out or not
                    this.setState({soldOut:soldOutOption(title,selection.label)})
                    // console.log(title,option + ' stock:' + )
                  } else {
                  // otherwise set it to weather or not the main item is in stock
                    this.setState({soldOut:soldOut(title)})
                  }
                  // if(soldOutOption(title,selection.label)){
                  //   this.setState({soldOut:true})
                  // }
                  State.setSelection(selection.value?selection.value:selection)
                  this.setState({cost:getCost(price,options,State.getSelection())})
                  // this.setState({soldOut:soldOut(title)})
                }}
              />
            }
            <Link to='/cart'>
              <div 
                className="Add-to-cart"
                onClick={(e)=>{
                  if(trackInventory || (trackOptions && options.length>0)){
                    if(this.state.soldOut){
                      State.Alert('Sorry this item is SOLD OUT!')
                      // setTimeout(()=>window.alert('Sorry this item is SOLD OUT!'),200)
                      e.preventDefault()
                    } else if (isAlreadyInCart(title)) {
                      State.Alert('this item is already in your cart, please go to your cart and change the amount instead')
                      // setTimeout(()=> window.alert('this item is already in your cart, please go to your cart and change the amount instead of adding more items from here'),200)
                      e.preventDefault()
                    } else if(noSelectionMade(options)){
                      State.Alert('Please select your option!')
                      // setTimeout(()=>window.alert('Please select your option!'),200)
                      e.preventDefault()
                    } else if(soldOutViaOtherOptions(this.props.fields)){
                      options.length>0 ?
                        State.Alert('Your cart already contains all the stock we have for this item! You can add this option after removing some of the other options from your cart') :
                        // setTimeout(()=>window.alert('Your cart already contains all the stock we have for this item! You can add this option after removing some of the other options from your cart'),200) :
                        State.Alert('Your cart already contains all the stock we have for this item!')
                        // setTimeout(()=>window.alert('Your cart already contains all the stock we have for this item!'),200)
                      e.preventDefault()
                    }else{
                      State.ATC({...this.props.fields,price:this.state.cost},String(State.getSelection()))
                    }
                  }else{
                    State.ATC({...this.props.fields,price:this.state.cost},String(State.getSelection()))
                  }
                }}
              >
                {this.state.soldOut ? 'SOLD OUT' : 'add to cart'}
              </div>
            </Link>
            <ReactMarkdown 
              source={longDescription} 
              renderers={{image:(props)=><img {...props} style={{maxWidth: '100%'}}/>}}
              className="Product-description"/>
          </div>
        </div>
      </div>
    )
  }
}

export default ProductPage