import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { TextField } from '@mui/material';
import { formatUSPhoneInput, getUSPhoneDigits } from '../../utils/usPhone';

// Counts digit characters in `formatted` that occur before `position`.
function digitIndexBeforePosition(formatted, position) {
  let count = 0;
  for (let i = 0; i < position && i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) count++;
  }
  return count;
}

// Finds the index right after the Nth digit (1-based) in `formatted`, so the
// cursor lands next to the same logical digit instead of jumping to the end.
function positionAfterDigitIndex(formatted, digitIndex) {
  if (digitIndex <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      count++;
      if (count === digitIndex) return i + 1;
    }
  }
  return formatted.length;
}

/**
 * MUI TextField for US phone numbers that formats as-you-type while keeping
 * the cursor where the user is editing (instead of jumping to the end on
 * every keystroke, which is what a naive controlled + reformat-on-change
 * input does).
 *
 * Usage mirrors a normal TextField, except `onChange` receives the new
 * formatted string directly instead of an event.
 */
export default function PhoneField({ value, onChange, onKeyDown, inputRef: inputRefProp, ...props }) {
  const inputRef = useRef(null);
  const pendingCursorRef = useRef(null);

  const setRefs = useCallback(
    (el) => {
      inputRef.current = el;
      if (typeof inputRefProp === 'function') inputRefProp(el);
      else if (inputRefProp) inputRefProp.current = el;
    },
    [inputRefProp]
  );

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && inputRef.current) {
      const pos = pendingCursorRef.current;
      inputRef.current.setSelectionRange(pos, pos);
      pendingCursorRef.current = null;
    }
  }, [value]);

  const applyDeletion = (current, digitsBefore, digitsToRemove) => {
    const rawDigits = getUSPhoneDigits(current).split('');
    rawDigits.splice(digitsBefore, digitsToRemove);
    const newFormatted = formatUSPhoneInput(rawDigits.join(''));
    pendingCursorRef.current = positionAfterDigitIndex(newFormatted, digitsBefore);
    onChange(newFormatted);
  };

  const handleKeyDown = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key !== 'Backspace' && e.key !== 'Delete') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; // let word/line-delete shortcuts fall through

    const input = e.currentTarget;
    const current = value || '';
    const selectionStart = input.selectionStart ?? current.length;
    const selectionEnd = input.selectionEnd ?? current.length;

    if (selectionStart !== selectionEnd) {
      e.preventDefault();
      const digitsBeforeStart = digitIndexBeforePosition(current, selectionStart);
      const digitsBeforeEnd = digitIndexBeforePosition(current, selectionEnd);
      applyDeletion(current, digitsBeforeStart, digitsBeforeEnd - digitsBeforeStart);
      return;
    }

    if (e.key === 'Backspace') {
      if (selectionStart === 0) {
        e.preventDefault();
        return;
      }
      let i = selectionStart - 1;
      while (i >= 0 && !/\d/.test(current[i])) i--;
      e.preventDefault();
      if (i < 0) {
        pendingCursorRef.current = 0;
        return;
      }
      applyDeletion(current, digitIndexBeforePosition(current, i), 1);
      return;
    }

    // Delete
    let i = selectionStart;
    while (i < current.length && !/\d/.test(current[i])) i++;
    e.preventDefault();
    if (i >= current.length) return;
    applyDeletion(current, digitIndexBeforePosition(current, i), 1);
  };

  const handleChange = (e) => {
    const rawValue = e.target.value;
    const rawCursor = e.target.selectionStart ?? rawValue.length;
    const digitsBeforeCursor = getUSPhoneDigits(rawValue.slice(0, rawCursor)).length;
    const formatted = formatUSPhoneInput(rawValue);
    pendingCursorRef.current = positionAfterDigitIndex(formatted, digitsBeforeCursor);
    onChange(formatted);
  };

  return (
    <TextField
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={props.placeholder || '(555) 123-4567'}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      inputRef={setRefs}
    />
  );
}
