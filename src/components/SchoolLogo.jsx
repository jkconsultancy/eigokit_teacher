import { useEffect, useState } from 'react';
import { getTheme } from '../lib/theme';
import './SchoolLogo.css';

export default function SchoolLogo({ className = '', fallbackText = 'EigoKit' }) {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const theme = getTheme();
    if (theme?.logo_url) {
      setLogoUrl(theme.logo_url);
    }
  }, []);

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt="School Logo" 
        className={`school-logo ${className}`}
      />
    );
  }

  // Fallback to text if no logo
  return (
    <span className={`school-logo-text ${className}`}>
      {fallbackText}
    </span>
  );
}

