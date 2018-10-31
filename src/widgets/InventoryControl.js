import React from 'react'
import {GITHUB_USERNAME} from '../PUBLIC_KEY.js'

const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/freemarket/contents/`

// const getInventory = async() =>{
//   let products = fetchProducts()
//   let inv = fetchInventory()
//   const inventory = await getTrackedItemsFromProducts(products,inv)
//   this.setState({inventory})
// }
const fetchProducts = () =>{
  try{
    return fetch( BASE_URL+ "content/products", { method:"GET" })
    .then(r=>r.json()).then(r=>r.map(f=>f.path))
    .then(paths=>{
      return Promise.all(
        paths.filter(p=>p!='content/products/.init').map(path=>
          fetch(BASE_URL+path,{ method:"GET" })
          .then(r=>r.json()).then(r=>JSON.parse(atob(r.content)))
      )
    )
    })
  }catch(e){console.log(e)}
}
// const fetchProducts = async() =>{
//   try{
//     fetch( BASE_URL+ "content/products", { method:"GET" })
//     .then(r=>r.json()).then(r=>r.map(f=>f.path))
//     .then(paths=>{
//       console.log('paths: '+JSON.stringify(paths))
//       return Promise.all(
//         paths.filter(p=>p!='content/products/.init').map(path=>
//           fetch(BASE_URL+path,{ method:"GET" })
//           .then(r=>r.json()).then(r=>JSON.parse(atob(r.content)))
//       )
//     )
//     })
//     .then(r=>{
//       console.log(r)
//       return r
//     })
//   }catch(e){console.log(e)}
// }
var fetchInventory = () =>{
  try{
    return fetch(`${BASE_URL}/content/inventory/inventory.json`,{ method:"GET" })
    .then(r=>r.json())
    .then(r=>JSON.parse(atob(r.content)).inventory)
  }catch(e){console.log(e)}
}

// const fetchInventory = async() =>{
//   try{
//     fetch(`${BASE_URL}/content/inventory/inventory.json`,{ method:"GET" })
//     .then(r=>r.json())
//     .then(r=>{
//       var data = JSON.parse(atob(r.content))
//       console.log(data)
//       return data.inventory
//     })
//   }catch(e){console.log(e)}
// }
// var getTrackedItemsFromProducts=(products=[],inv=[])=>{
//   var inventory = []
//   for(let {title='',options=[],trackInventory=false, trackOptions=false} of products){
//     // if the product is tracked, unless all the items stock separate, log the product as is
//     if(trackInventory && (options.length==0 || options.some(({separateStock=false})=>separateStock==false))){
//       inventory.push(title)
//     }
//     // look for options that stock separate and push them as a string like : 'product(option)'
//     options.forEach(({separateStock=false,title:optionTitle=''})=>{
//       separateStock && inventory.push(`${title}(${optionTitle})`)
//     })
//   }
//   // return the list of objects, of tracked products and options with their titles and quantities
//   return inventory.map(title=>{
//     const value = inv.filter(x=>x.title==title).length!=0 ? inv.filter(x=>x.title==title)[0].value : 0
//     return {title,value}
//   })
// }

var getTrackedItemsFromProducts=(products=[],inv=[])=>{
  var inventory = []
  for(let {title='',options=[],trackInventory=false, trackOptions=false} of products){
    if(!trackInventory && (!trackOptions || options.length==0)){return}
    if(trackInventory && (!trackOptions || options.length==0)){
        inventory.push(title)
    }
    if(trackOptions && options.length>0){
      options.forEach(({title:optionTitle=''})=>{
        inventory.push(`${title}(${optionTitle})`)
      })
    }
  }
  return inventory.map(title=>{
    const value = inv.filter(x=>x.title==title).length!=0 ? inv.filter(x=>x.title==title)[0].value : 0
    return {title,value}
  })
}

export function InventoryControl(data){
  class InventoryControl extends React.Component{
    constructor(props){
      super(props)
      this.state={inventory:[]}
      // this.state={inventory:data.products ? this.getLines(data.products) :[]}
    }
    componentDidMount(){
      this.getInventory()
      .then(inventory=>{
        console.log(inventory)
        this.setState({inventory})
      })
      // try{
      //   fetch( BASE_URL+ "content/products", { method:"GET" })
      //   .then(r=>r.json()).then(r=>r.map(f=>f.path))
      //   .then(paths=>{
      //     console.log('paths: '+JSON.stringify(paths))
      //     return Promise.all(
      //       paths.filter(p=>p!='content/products/.init').map(path=>
      //         fetch(BASE_URL+path,{ method:"GET" })
      //         .then(r=>r.json()).then(r=>JSON.parse(atob(r.content)))
      //     )
      //   )
      //   })
      //   .then(r=>{
      //     console.log('allfiles'+JSON.stringify(r))
      //     this.setState({inventory:getTrackedItemsFromProducts(r)})
      //   })
      // }catch(e){console.log(e)}
    }
    getInventory = () =>{
      return Promise.all([
        fetchProducts(),  
        fetchInventory(),
      ]).then(([p,i])=>getTrackedItemsFromProducts(p,i))
    }

    // getInventory = async() => 
    //   getTrackedItemsFromProducts(await fetchProducts(), await fetchInventory())

    // getInventory = async() =>{
    //   let products = fetchProducts()
    //   let inventory = fetchInventory()
      // let products = await productsP
      // let inv = await invP
      // return getTrackedItemsFromProducts(await products,await inventory)
      // return getTrackedItemsFromProducts(products,inv)
    // }    
    // getInventory = async() =>{
    //   let products = await fetchProducts()
    //   let inv = await fetchInventory()
    //   const inventory = getTrackedItemsFromProducts(products,inv)
    //   this.setState({inventory})
    // }

    // getLines=(rawProducts=[])=>{
    //   console.log('getLInes=>' + JSON.stringify(rawProducts),rawProducts)
    //   var display = []
    //   const stock = this.props.value
    //   const products = []
    //   rawProducts.forEach(p=>{
    //     // sometimes options is undefined
    //     if(p.options==undefined){
    //      p.trackInventory && products.push(p.title)
    //     }else{
    //       if(p.options.length==0 && p.trackInventory){products.push(p.title)}
    //       //if every option tracks its own stock, dont include the parent category, even if it has trackInventory
    //       if(p.options.length>0 && p.trackInventory){
    //         if(!p.options.every(o=>o.separateStock)){products.push(p.title)}
    //       }
    //       if(p.options.length>0){
    //         p.options.forEach(o=>{
    //           if(o.separateStock){
    //             products.push(''+p.title+'('+o.title+')')
        
    //   }})}}})
    //   products.forEach(title=>{
    //     const value = stock[title] ? stock[title] : 0
    //     display.push({title,value})
    //   })
    //   return display
    // }
    // const getTrackedItemsFromProducts=(products=[],inv={})=>{
//   const I = inv.inventory || []
//   var inventory = []
//   for(let {title='',options=[],trackInventory=false} of products){
//     // if the product is tracked, unless all the items stock separate, log the product as is
//     if(trackInventory && (options.length==0 || options.some(({separateStock=false})=>separateStock==false))){
//       inventory.push(title)
//     }
//     // look for options that stock separate and push them as a string like : 'product(option)'
//     options.forEach(({separateStock=false,title:optionTitle=''})=>{
//       separateStock && inventory.push(`${title}(${optionTitle})`)
//     })
//   }
//   // return the list of objects, of tracked products and options with their titles and quantities
//   return inventory.map(title=>{
//     const quantity = I.filter(x=>x.title==title).length!=0 ? I.filter(x=>x.title==title)[0].value : 0
//     return {title,quantity}
//   })
// }

    
    handleChange = ({title,value}) => {
      var {inventory} = this.state
      //find the element fo the array with the right title
      const field = inventory.filter(i=>i.title==title)[0]
      field.value = value
      this.props.onChange(inventory);
      this.setState({inventory})
    };
    
    render(){
      // console.log(this.props)
      // console.log(JSON.stringify(this.props))
      // console.log(this.props.fields)
      // console.log(JSON.stringify(this.props.fields))
      // const {value} = this.props
      // console.log("value=> "+value.get(0))
      // console.log("value.value=> "+value.get(0).get('value'))
      return(
        <div>
          {this.state.inventory.map((item,i)=>
            <InventoryLine {...this.props} 
              key={i} 
              item={item} 
              // check that this is the right value by name
              // value={getValueOrZero(item.title,value)} 
              handleChange={this.handleChange} />
          )}
        </div>
      )
    }
  }
  return InventoryControl
}

const InventoryLine = ({ forID,classNameWrapper,setActiveStyle,setInactiveStyle,item,handleChange }) =>
    <div>
      <div>{item.title}</div>
      <input
        type="text"
        id={forID}
        //this is wrong
        value={item.value||''}
        onChange={(e)=>handleChange({title:item.title,value:e.target.value})}
        className={classNameWrapper}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    </div>