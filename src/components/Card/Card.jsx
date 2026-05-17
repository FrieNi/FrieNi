// Card — composable header / body / footer
const Card = ({ variant = 'flat', hover, title, titleSize = 'sm', actions, children, footer, bodyClass = '', className = '', ...rest }) => {
  return (
    <div className={`card card-${variant} ${hover ? 'card-hover' : ''} ${className}`} {...rest}>
      {title && (
        <div className="card-head">
          <div className={titleSize === 'lg' ? 'card-title-lg' : 'card-title'}>{title}</div>
          {actions && <div className="row row-gap-2">{actions}</div>}
        </div>
      )}
      <div className={`${bodyClass.includes('tight') ? 'card-body-tight' : 'card-body'} ${bodyClass}`}>{children}</div>
      {footer && <div className="card-foot">{footer}</div>}
    </div>
  );
};
window.Card = Card;
