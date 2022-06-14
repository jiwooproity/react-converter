import React from "react";
import _ from "lodash";
import styled from "styled-components";

const SelectBoxElement = styled.select`
  width: 380px;
  padding: 5px 5px 5px 5px;
  border: none;
  margin-left: 5px;
  outline: 0 none;
  font-size: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

const SelectBoxOption = styled.option``;

const SelectBox = (props) => {
  const { data, onSelect } = props;

  return (
    <SelectBoxElement onChange={onSelect}>
      {_.map(data, (item, index) => (
        <SelectBoxOption key={index} value={item.value} id={item.id}>
          {item.name}
        </SelectBoxOption>
      ))}
    </SelectBoxElement>
  );
};

export default SelectBox;
