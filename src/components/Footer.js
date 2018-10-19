import React from 'react'
import './Footer.css'

export default ({ globalSettings, socialSettings, navLinks, text }) => (
  <footer className='Footer'>
    <div className='container taCenter'>
      <span>
        {/* © 2018 All rights reserved. */}
        {text}
        </span>
    </div>
  </footer>
)
