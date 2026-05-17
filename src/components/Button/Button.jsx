// Button — prefix class names with "btn"
const Button = ({ variant = 'secondary', size, icon, children, className = '', ...rest }) => {
  const cls = ['btn', `btn-${variant}`, size && `btn-${size}`, icon && !children && 'btn-icon', className]
    .filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {icon && <span className="btn-ico">{icon}</span>}
      {children}
    </button>
  );
};
window.Button = Button;
