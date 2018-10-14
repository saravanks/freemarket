import React from 'react'
import {GITHUB_USERNAME} from '../PUBLIC_KEY.js'

const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/freemarket/contents/`

export function InventoryControl(data){
  class InventoryControl extends React.Component{
    constructor(props){
      super(props)
      this.state={inventory:data.products ? this.getLines(data.products) :[]}
    }
    componentDidMount(){
      try{
        fetch( BASE_URL+ "content/products", { method:"GET" })
        .then(r=>r.json()).then(r=>r.map(f=>f.path))
        .then(paths=>{
          console.log('paths: '+JSON.stringify(paths))
          return Promise.all(
            paths.filter(p=>p!='content/products/.init').map(path=>
              fetch(BASE_URL+path,{ method:"GET" })
              .then(r=>r.json()).then(r=>JSON.parse(atob(r.content)))
          )
        )
        })
        .then(r=>{
          console.log('allfiles'+JSON.stringify(r))
          this.setState({inventory:this.getLines(r)})
        })
      }catch(e){console.log(e)}
    }

    getLines=(rawProducts=[])=>{
      console.log('getLInes=>' + JSON.stringify(rawProducts),rawProducts)
      var display = []
      const stock = this.props.value
      const products = []
      rawProducts.forEach(p=>{
        // sometimes options is undefined
        if(p.options==undefined){
         p.trackInventory && products.push(p.title)
        }else{
          if(p.options.length==0 && p.trackInventory){products.push(p.title)}
          //if every option tracks its own stock, dont include the parent category, even if it has trackInventory
          if(p.options.length>0 && p.trackInventory){
            if(!p.options.every(o=>o.separateStock)){products.push(p.title)}
          }
          if(p.options.length>0){
            p.options.forEach(o=>{
              if(o.separateStock){
                products.push(''+p.title+'('+o.title+')')
        
      }})}}})
      products.forEach(title=>{
        const value = stock[title] ? stock[title] : 0
        display.push({title,value})
      })
      return display
    }
    
    handleChange = ({title,value}) => {
      var {inventory} = this.state
      //find the element fo the array with the right title
      const field = inventory.filter(i=>i.title==title)[0]
      field.value = value
      this.props.onChange(inventory);
      this.setState({inventory})
    };
    
    render(){
      console.log(this.props)
      console.log(JSON.stringify(this.props))
      console.log(this.props.fields)
      console.log(JSON.stringify(this.props.fields))
      const {value} = this.props
      return(
        <div>
          {this.state.inventory.map((item,i)=>
            <InventoryLine {...this.props} key={i} item={item} value={value[i]} handleChange={this.handleChange} />
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
        value={item.value}
        onChange={(e)=>handleChange({title:item.title,value:e.target.value})}
        className={classNameWrapper}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    </div>