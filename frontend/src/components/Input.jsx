import { useState } from 'react';
import './Input.css';

export default function Input({ label, type = 'text', name, value, onChange, placeholder, required, autoComplete, error }) {
  const [focused, setFocused] = useState(false);
  const hasValue = value && value.length > 0;

  return (
    <div className={`input-group ${error ? 'input-error' : ''}`}>
      <div className={`input-wrapper ${focused || hasValue ? 'input-focused' : ''}`}>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="input-field"
        />
        {label && (
          <label className={`input-label ${focused || hasValue ? 'label-active' : ''}`}>
            {label} {required && <span className="required">*</span>}
          </label>
        )}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
}
