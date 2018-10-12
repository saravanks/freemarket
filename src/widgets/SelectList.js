import React from 'react'
export function SelectList(data,ListWidget){
  return class SelectList extends React.Component {
    render(){
      return(
        <ListWidget {...this.props}/>
      )
    }
  }
}
