import React from 'react'

export function RelationSelectControl(SelectWidget){
  class RelationSelectControl extends React.Component{
    constructor(props){
      super(props)
      console.log(JSON.stringify(props))
    }
    render(){
      return(
        <div>
          <SelectWidget {...this.props} />
        </div>

      )
    }
  }
  return RelationSelectControl
}