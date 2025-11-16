import React from 'react';
import './card.scss';

const Card = ({
  children,
  title,
  subtitle,
  image,
  imageAlt,
  variant = 'default', // 'default', 'sport', 'news', 'weather', 'compact'
  className = '',
  onClick,
  footer,
  badge,
  badgeClassName = '',
  loading = false,
  ...props
}) => {
  const cardClasses = [
    'card',
    `card--${variant}`,
    loading ? 'card--loading' : '',
    onClick ? 'card--clickable' : '',
    className
  ].filter(Boolean).join(' ');
  
  const badgeClasses = ['card__badge', badgeClassName].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={cardClasses} {...props}>
        <div className="card__skeleton">
          <div className="card__skeleton-image"></div>
          <div className="card__skeleton-content">
            <div className="card__skeleton-line card__skeleton-line--title"></div>
            <div className="card__skeleton-line card__skeleton-line--subtitle"></div>
            <div className="card__skeleton-line card__skeleton-line--text"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      {badge && (
        <div className={badgeClasses}>
          {badge}
        </div>
      )}
      
      {image && (
        <div className="card__image">
          <img src={image} alt={imageAlt || title || 'Image'} />
        </div>
      )}
      
      <div className="card__content">
        {title && (
          <h3 className="card__title">{title}</h3>
        )}
        
        {subtitle && (
          <p className="card__subtitle">{subtitle}</p>
        )}
        
        {children && (
          <div className="card__body">
            {children}
          </div>
        )}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;