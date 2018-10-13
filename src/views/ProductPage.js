import React from 'react'
import State from './state'
import ReactMarkdown from 'react-markdown'
import Link from '../components/Link'
import Select from '../components/Select'
import Gallery from '../components/Gallery'
import { observer } from 'mobx-react';
import data from '../data.json'

import './ProductPage.css'

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

const isAlreadyInCart = title =>{
  const selected = State.getSelection()
  const cart = State.getCart()
  var isInCart = false
  cart.forEach(item=>{
    if(item.title==title && item.selected==selected){
      isInCart = true
    }
  })
  return isInCart
}

const getCost = (price,options,selection) =>{
  if(options.filter(o=>o.title==selection).length>0){
    return parseFloat(price) + parseFloat(options.filter(o=>o.title==selection)[0].cost)
  }
  return price
}

const soldOutOption = (p,o) => {
  // do we track this options separate?
  return data.products.filter(x=>x.title==p)[0].options.filter(x=>x.title==o)[0].separateStock &&
  // we have a listing in inventory for it
  data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p+'('+o+')').length>0 &&
  // is it sold out?
  data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p+'('+o+')')[0].value<1
}
const soldOut = p => {
  // do we track this products stock?
  return data.products.filter(x=>x.title==p)[0].trackInventory &&
  // do we have a listing for it in inventory file?
  data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p).length>0 &&
  // is it sold out?
  data.inventory.filter(x=>x.name=='inventory')[0].inventory.filter(x=>x.title==p)[0].value<1
}
const noSelectionMade=options=>{
  if(options.length>0 && State.getSelection() == ''){
    return true
  }
  return false
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
    const {title,options=[]}=this.props.fields
    if(soldOut(title) && options.every(o=>soldOutOption(title,o.title))){
      this.setState({soldOut:true})
    }
    State.setSelection('')

  }
  render(){
    const { trackInventory, title, price, longDescription, images, options=[] } = this.props.fields
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
              <div className="Product-price">${this.state.cost}</div>
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
                  cost:o.cost
                }))
                ]}
                onChange={(selection)=>{
                  // if this new selection gets stock tracked separately
                  if( data.products.filter(x=>x.title==title)[0].options.filter(x=>x.title==selection.label)[0].separateStock){
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
                  if(trackInventory || options.some(o=>o.separateStock)){
                    if(isAlreadyInCart(title)){
                      e.preventDefault()
                      alert('this item is already in your cart, please go to your cart and change the amount instead of adding more items from here')
                    } else if(this.state.soldOut) {
                      e.preventDefault()
                      alert('Sorry this item is SOLD OUT!')
                    } else if(noSelectionMade(options)){
                      e.preventDefault()
                      alert('Please select your option!')
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