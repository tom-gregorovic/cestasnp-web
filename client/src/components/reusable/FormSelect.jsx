import React from 'react';
import { useStateProp } from '../../helpers/reactUtils';
import FormItem from './FormItem';

const FormSelect = (props) => {

  const [value, setValue] = useStateProp(props.value);
  
  return (
    <FormItem {...props} value={props.valueText || value} >
      <select
        className={props.itemClassName}
        id={props.valueName}
        name={props.valueName}
        onBlur={e => setValue(e.target.value)}
        onChange={e => setValue(e.target.value)}
        value={value}>
        {props.children}
        {!!props.options && props.options.map((option, i) => <option key={i} value={option.value} label={option.label}>{option.label}</option>)}
      </select>
      {props.labelChildren}
    </FormItem>
  )
}
export default FormSelect;