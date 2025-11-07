import React from 'react';
import Dropdown from '@rippling/pebble/Dropdown';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { DURATION, EASING, SCALE } from '@/utils/animation-constants';

const fadeScaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(${SCALE.initial});
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const AnimatedDropdownWrapper = styled.div`
  display: inline-block;

  [role='menu'],
  [role='listbox'] {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut};
    transform-origin: top;
  }
`;

interface AnimatedDropdownProps {
  children: React.ReactElement;
  list: Array<{ label: string; value: string }>;
  onChange?: (value: string) => void;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({ children, list, onChange }) => {
  return (
    <AnimatedDropdownWrapper>
      <Dropdown list={list} onChange={onChange}>
        {children}
      </Dropdown>
    </AnimatedDropdownWrapper>
  );
};

export default AnimatedDropdown;
