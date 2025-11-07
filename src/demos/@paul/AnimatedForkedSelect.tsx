import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import ForkedSelect from '@/components/ForkedSelect';
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

const fadeScaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(${SCALE.initial});
  }
`;

const AnimatedForkedSelectWrapper = styled.div`
  display: inline-block;

  /* Animate the dropdown menu on entrance */
  [role='listbox'] {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut};
    transform-origin: top;
  }

  /* Animate the dropdown menu on exit */
  .select-menu-closing [role='listbox'] {
    animation: ${fadeScaleOut} ${DURATION.fast} ${EASING.easeIn};
    transform-origin: top;
  }

  /* Animate the caret icon rotation */
  [data-testid='select-controller'] > div:last-child {
    transition: transform 150ms ease-out;
  }
`;

interface AnimatedForkedSelectProps {
  id: string;
  isRequired: boolean;
  placeholder?: string;
  list: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

const AnimatedForkedSelect: React.FC<AnimatedForkedSelectProps> = props => {
  return (
    <AnimatedForkedSelectWrapper>
      <ForkedSelect {...props} />
    </AnimatedForkedSelectWrapper>
  );
};

export default AnimatedForkedSelect;
