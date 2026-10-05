'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './auth.module.css';

type Props = InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; hint?: string; error?: string; optional?: boolean };

export default function AuthField({ id, label, hint, error, optional, type = 'text', ...props }: Props) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={styles.field}>
      <div className={`${styles.inputWrap} ${error ? styles.invalid : ''}`}>
        <div className={styles.inputBody}>
          <label htmlFor={id}>{label}{optional && <span className={styles.optional}>Opcional</span>}</label>
          <input {...props} id={id} type={isPassword && visible ? 'text' : type} aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-help` : undefined} />
        </div>
        {isPassword && <button className={styles.reveal} type="button" disabled={props.disabled} onClick={() => setVisible(!visible)} aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`} aria-controls={id} aria-pressed={visible}>{visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>}
      </div>
      {(error || hint) && <p id={`${id}-help`} className={error ? styles.fieldError : styles.hint} aria-live="polite">{error || hint}</p>}
    </div>
  );
}
