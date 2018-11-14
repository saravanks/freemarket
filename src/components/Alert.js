import React from 'react'
import './Alert.css'
import State from '../views/state'

const Alert = ({text}) =>
  <div>
    <div className='Alert-Container'>
    </div>
    <div className='Alert-Box'>
      <div className='Alert-Text'>
        {text}
      </div>
      <div 
        className='Alert-Button'
        onClick={()=>State.showAlert.set(false)}
      >
        OK
      </div>
    </div>
  </div>
export default Alert