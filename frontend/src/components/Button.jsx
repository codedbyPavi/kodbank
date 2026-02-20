import './Button.css';

export default function Button({ 
  children, 
  type = 'button', 
  onClick, 
  disabled, 
  loading, 
  variant = 'primary',
  fullWidth = false,
  className = ''
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
