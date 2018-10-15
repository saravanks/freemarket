

// works perfect, cannot crash :)
var f =_=>[_].filter(_=>_).flatMap(({products=[]}) => products.filter(_=>_)
.flatMap( ({ options=[], title='', trackInventory=false }) => [
  ...options.filter(_=>_).flatMap(({ separateStock=false, title:optionTitle='' }) =>
    separateStock?`${title}(${optionTitle})`:[]),
  ...trackInventory && (!options.length || options.some(o=>o.separateStock==false)) ?
    [title] : []
]))


var f = (data={}) => (({products=[]}) => products.filter(_=>_)
.flatMap( ({ options=[], title='', trackInventory=false }) => [
  ...options.filter(_=>_).flatMap(({ separateStock=false, title:optionTitle='' }) =>
    separateStock ? `${title}(${optionTitle})` : [] ),
  ...trackInventory && (!options.length || options.some(o=>o.separateStock==false)) ?
    [title] : []
]))(data)


var f = (data=[]) => [...new Set([data]
.flatMap( ({ products=[] }) => products
.flatMap( ({ options=[], title='', trackInventory=false }) => 
(options.length ? options : [{}])
.flatMap( ({ separateStock=false, title:optionTitle='' }) => 
separateStock ? `${title}(${optionTitle})` : trackInventory ? title : [] 
))))]


var f = (data={}) => [...new Set((({products=[]}) => products
.flatMap( ({ options=[], title='', trackInventory=false }) => 
  (options.length ? options : [{}])
.flatMap( ({ separateStock=false, title:optionTitle='' }) => 
  separateStock ? `${title}(${optionTitle})` : trackInventory ? title : [] 
)))(data))]


[data].flatMap( ({ products=[] }) => products
.flatMap( ({ options=[], title='', trackInventory=false }) => [...options,{}]
.flatMap( ({ separateStock=false, title:optionTitle='' }) =>
  separateStock ? `${title}(${optionTitle})` : trackInventory ? title : [])))


const test = (data=[]) => [data]
.flatMap( ({ products=[] }) => products
.flatMap( ({ options=[], title='', trackInventory=false }) => 
  [trackInventory ? title : [], ...options
.flatMap( ({ separateStock=false, title:optionTitle='' }) => 
  separateStock ? `${title}(${optionTitle})` : [] 
)]))


var f = (data=[]) => [...new Set([data]
  .flatMap( ({ products=[] }) => products
  .flatMap( ({ options=[], title='', trackInventory=false }) => 
  options==[] ? [title] : options.flatMap(
    separateStock ? `${title}(${optionTitle})` : trackInventory ? title : [] 
  ))))]

