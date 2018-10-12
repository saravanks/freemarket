import React from 'react'
export function SelectList(data,ListWidget){
  return class SelectList extends React.Component {
    render(){
      var _props = this.props
      var x = {value:'one',
              label:'one',
              name:'one'}
      x.get=s=>x[s]
      const value = [x]
      value.get=x=>value[x]
      value.set=(x,y)=>value[x]=y
      value.remove=x=>value.splice(x,1)
      value.delete=x=>{
        value.splice(x,1)
        return value
      }
      value.insert=(x,y)=>{
        value.splice(x,0,y)
        return value
      }
      _props.value = value
      return(
        <ListWidget {..._props}/>
      )
    }
  }
}
