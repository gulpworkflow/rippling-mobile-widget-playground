import React from 'react';
import Select from '@rippling/pebble/Inputs/Select';
import styled from '@emotion/styled';
import { keyframes, css, Global } from '@emotion/react';
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

const globalStyles = css`
  /* Add transition to ALL select dropdown arrows */
  [data-testid='select-controller'] svg {
    transition: transform 150ms ease-out;
  }

  /* When a listbox is present in the DOM, rotate all select arrows */
  /* This is a hack but works for demo purposes */
  body:has([role='listbox']) [data-testid='select-controller'] svg {
    transform: rotate(180deg);
  }
`;

const AnimatedSelectWrapper = styled.div`
  /* Animate the dropdown menu */
  [role='listbox'] {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut};
    transform-origin: top;
  }
`;

interface AnimatedSelectProps {
  placeholder?: string;
  list: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

const AnimatedSelect: React.FC<AnimatedSelectProps> = props => {
  return (
    <>
      <Global styles={globalStyles} />
      <AnimatedSelectWrapper>
        <Select {...props} />
      </AnimatedSelectWrapper>
    </>
  );
};

export default AnimatedSelect;
