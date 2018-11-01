import React from 'react'
import ReactMarkdown from 'react-markdown'
import Select from '../components/Select'
import Gallery from '../components/Gallery'

import './ProductPage.css'

const toDollars = x => parseFloat(x).toFixed(2)


export default ({ fields }) => {
  const { title='', price=0, longDescription='', images=[], options=[] } = fields
  return (
    <div className="Product-Page-Wrapper">
      <div className="Product-Page-Container">
        <div className="Product">
          <Gallery imageList={images}/>
          <div className="Product-bar">
            <div className="Product-name">{title || ''}</div>
            <div className="Product-price">${price}</div>
          </div>
          {options && options.length>0 &&
            <Select
              title='Please Select :'
              options={[...options.map(o=>({
                label:o.title,
                value:o.title,
                cost:toDollars(o.cost || 0)
              }))
              ]}
            />
          }
          <div 
            className="Add-to-cart" 
          >
            add to cart
          </div>
          <ReactMarkdown 
            source={longDescription} 
            className="Product-description"/>
        </div>
      </div>
    </div>
  )
}