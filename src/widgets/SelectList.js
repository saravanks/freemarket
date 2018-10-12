import React from 'react'
export function SelectList(data,ListWidget){
  return class SelectList extends React.Component {
    render(){
      var _props = this.props
      _props.value = ["one,two,three"]
      return(
        <ListWidget {...this.props}/>
      )
    }
  }
}
