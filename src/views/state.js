import { observable,configure } from "mobx"

configure({ isolateGlobalState: true })

class State {
  alertText = observable.box(' ')
  cart = observable([])
  selection = observable.box(' ')
  fields = observable({})
  carrier = observable.box(' ')
  carriers = observable([])
  region = observable.box(' ')
  regions = observable([])
  shippingCost = observable.box(0)
  discount = observable.box(0)
  discountPercent = observable.box(true)
  showAlert = observable.box(false)
  transactionComplete = observable.box(0)
  
  Alert=text=>{
    this.alertText.set(text)
    this.showAlert.set(true)
  }
  setDiscount = discount => this.discount=discount
  getDiscount = () => this.discount
  setDiscountPercent = discountPercent => this.discountPercent=discountPercent
  getDiscountPercent = () => this.discountPercent
  setField =(field,val)=>this.fields[field]=val
  getField = field => this.fields[field] ? this.fields[field] : false
  ATC = (item,selected='')=> this.cart.push({...item,quantity:1,selected})
  RFC = i=> this.cart.replace(this.cart.slice(0,i).concat(this.cart.slice(i+1)))
  modCart=(index,q)=>this.cart[index].quantity=q
  getTotal=()=>{
    var total = 0
    this.cart.forEach(p=>total+=p.price * p.quantity)
    return total
  }
  getTotalWithShipping=()=>{
    const total= this.getTotal()+this.shippingCost.get()
    return total 
  }
  getCart=()=>this.cart.slice().filter(x=>x.quantity>0)
  setRegions=(x)=>this.regions.replace(x)
  getRegions=()=>this.regions.slice()
  setCarriers=x=>this.carriers.replace(x)
  getCarriers=()=>this.carriers.slice()
  setSelection=(x)=>this.selection.set(x)
  getSelection=()=>this.selection.get()
  setCarrier=x=>this.carrier.set(x)
  getCarrier=()=>this.carrier.get()
  setRegion=x=>this.region.set(x)
  getRegion=x=>this.region.get()

  setTransactionComplete=x=>this.transactionComplete.set(x)
  getTransactionComplete=x=>this.transactionComplete.get()

  getQuantityOfItemInCart=item=>{
    const {title, selected, trackInventory, trackOptions, options} = item
    var num = 0
    // in the case that there are options that stock all together
    if(trackInventory && !trackOptions && options.length>0){
      this.getCart().forEach(i=>{
        if(i.title==title){
          num += i.quantity
        }
      })
    // but in general we just do this
    }else{
      this.getCart().forEach(i=>{
        if(i.title==title && i.selected==selected){
          num += i.quantity
        }
      })
    }
    return num
  }
  

  reset=()=>{
    this.cart.replace([])
    this.carriers.replace([])
    this.regions.replace([])
    this.carrier.set(' ')
    this.region.set(' ')
    this.shippingCost.set(0)
    // this.transactionComplete.set(0)
  }
}
export default State = new State()