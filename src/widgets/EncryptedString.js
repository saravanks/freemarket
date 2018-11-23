import React from 'react';
import SimpleCrypto from "simple-crypto-js"
import {GITHUB_PASSWORD} from '../PUBLIC_KEY.js'
const simpleCrypto = new SimpleCrypto(GITHUB_PASSWORD)

// onChange={e => onChange(e.target.value)}

export default class EncryptedString extends React.Component {

  render() {
    const {
      forID,
      value='',
      onChange,
      classNameWrapper,
      setActiveStyle,
      setInactiveStyle,
    } = this.props;

    return (
      <input
        type="text"
        id={forID}
        className={classNameWrapper}
        value={value=='' ? '' : this.decryptValue(value)}
        onChange={e => this.onChangeEncrypt(e.target.value)}
        onFocus={setActiveStyle}
        onBlur={setInactiveStyle}
      />
    );
  }
  onChangeEncrypt = value => this.props.onChange(simpleCrypto.encode(value))
  decryptValue    = value => simpleCrypto.decrypt(value)

}