'use client';

import { useEffect, useId } from 'react';
import {
  MotionValue,
  motion,
  useSpring,
  useTransform,
  motionValue,
} from 'motion/react';
import useMeasure from 'react-use-measure';
import { cn } from '@/lib/utils';

// Adjusted for slower, bouncier movement
const TRANSITION = {
  type: 'spring' as const,
  stiffness: 175,  // Reduced from 280 for slower pull
  damping: 40,    // Reduced to allow overshoot (bounce)
  mass: 1.2,      // Increased to add 'weight' and slow momentum
};

function Digit({ value, place }: { value: number; place: number }) {
  const valueRoundedToPlace = Math.floor(value / place) % 10;
  const initial = motionValue(valueRoundedToPlace);
  const animatedValue = useSpring(initial, TRANSITION);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
      <div className='relative inline-block w-[1ch] h-[1em] overflow-hidden leading-none tabular-nums'>
        {/* Ghost element to maintain width, strictly hidden from screen readers */}
        <div className='invisible' aria-hidden="true">0</div>

        {Array.from({ length: 10 }, (_, i) => (
            <Number key={i} mv={animatedValue} number={i} />
        ))}
      </div>
  );
}

function Number({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const uniqueId = useId();
  const [ref, bounds] = useMeasure();

  const y = useTransform(mv, (latest) => {
    if (!bounds.height) return 0;
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * bounds.height;

    if (offset > 5) {
      memo -= 10 * bounds.height;
    }

    return memo;
  });

  return (
      <motion.span
          style={{ y }}
          layoutId={`${uniqueId}-${number}`}
          className='absolute inset-0 flex items-center justify-center'
          transition={TRANSITION}
          ref={ref}
      >
        {number}
      </motion.span>
  );
}

type SlidingNumberProps = {
  value: number;
  padStart?: boolean;
  decimalSeparator?: string;
  className?: string;
  decimalPlaces?: number;
};

export function SlidingNumber({
                                value,
                                padStart = false,
                                decimalSeparator = '.',
                                className,
                                decimalPlaces = 2,
                              }: SlidingNumberProps) {
  // Ensure we are working with a valid number, even if a string is accidentally passed
  const rawValue = typeof value === 'string' ? parseFloat(value) : value;
  const absValue = Math.abs(rawValue);

  const fixedValue = absValue.toFixed(decimalPlaces);
  const [integerPart, decimalPart] = fixedValue.split('.');

  const integerValue = parseInt(integerPart, 10);
  const paddedInteger =
      padStart && integerValue < 10 ? `0${integerPart}` : integerPart;
  const integerDigits = paddedInteger.split('');
  const integerPlaces = integerDigits.map((_, i) =>
      Math.pow(10, integerDigits.length - i - 1)
  );

  return (
      <div className={cn('flex items-center', className)}>
        {rawValue < 0 && '-'}
        {integerDigits.map((_, index) => (
            <Digit
                key={`int-${integerPlaces[index]}`}
                value={integerValue}
                place={integerPlaces[index]}
            />
        ))}

        {decimalPlaces > 0 && (
            <>
              <span>{decimalSeparator}</span>
              {decimalPart.split('').map((_, index) => (
                  <Digit
                      key={`dec-${index}`}
                      value={parseInt(decimalPart, 10)}
                      place={Math.pow(10, decimalPart.length - index - 1)}
                  />
              ))}
            </>
        )}
      </div>
  );
}