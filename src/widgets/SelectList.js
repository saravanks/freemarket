import React from 'react'
export function SelectList(data,listwidget){
  return class SelectProduct extends React.Component {
    render(){
      return(
        <listwidget {...this.props}/>
      )
    }
  }
}
