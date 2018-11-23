import React from 'react'
import {GITHUB_USERNAME,GITHUB_PASSWORD} from '../PUBLIC_KEY.js'
import SimpleCrypto from "simple-crypto-js"

const simpleCrypto = new SimpleCrypto(GITHUB_PASSWORD)
const BASE_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/freemarket/contents/`


var fetchPromoCodes = () =>{
  try{
    return fetch(`${BASE_URL}/content/promoCodes/promoCodes.json`,{ method:"GET" })
    .then(r=>r.json())
    .then(r=>{
      const promoCodes = JSON.parse(atob(r.content)).promoCodes
      console.log('inv Fetch=>'+JSON.stringify(promoCodes))
      return promoCodes
    })
  }catch(e){console.log(e)}
}

var decryptPromoCodes = encryptedPromoCodes =>
  simpleCrypto.decrypt(encryptedPromoCodes,true)

export function PromoCodes(data){
  class PromoCodes extends React.Component{
    constructor(props){
      super(props)
      this.state={promoCodes:{}}
    }
    componentDidMount(){
      fetchPromoCodes()
      .then(encryptedPromoCodes=>{
        const promoCodes = decryptPromoCodes(encryptedPromoCodes)
        console.log('setstate=>'+JSON.stringify(promoCodes))
        this.setState({promoCodes})
      })
    }
    handleChange = ({title,value}) => {
      var {promoCodes} = this.state
      promoCodes[title] = value
      const encryptedPromoCodes = simpleCrypto.encode(promoCodes)
      this.props.onChange(encryptedPromoCodes);
      this.setState({promoCodes})
    };
    
    render(){
      const promoCodes = Object.keys(this.state.promoCodes).map(c=>({title:c,value:promoCodes[c]}))
      return(
        <div>
          {promoCodes.map((item,i)=>
            <PromoCodeLine {...this.props} 
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
  return PromoCodes
}

const PromoCodeLine = ({ forID,classNameWrapper,setActiveStyle,setInactiveStyle,item,handleChange }) =>
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