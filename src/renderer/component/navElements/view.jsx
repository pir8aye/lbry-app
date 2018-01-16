import React from 'react';
import Button from 'component/link';
import classnames from 'classnames';

const NavigationElements = props => {
  const { pageTitle, navigate, back, forward, isBackDisabled, isForwardDisabled, navLinks } = props;
  return (
    <nav className="nav">
      <div className="nav__actions-top">
        <Button
          alt
          circle
          icon="home"
          description={__('Home')}
          onClick={() => navigate('/discover')}
          disabled={pageTitle === 'Discover'}
        />
        <div>
          <Button
            alt
            circle
            icon="arrow-left"
            description={__('Navigate back')}
            onClick={back}
            disabled={isBackDisabled}
          />
          <Button
            alt
            circle
            icon="arrow-right"
            description={__('Navigate forward')}
            onClick={forward}
            disabled={isForwardDisabled}
          />
        </div>
      </div>

      <div className="nav__links">
        <ul className="nav__primary">
          {navLinks.primary.map(({ label, path, active, icon }, index) => (
            <li
              key={index}
              className={classnames('nav__link nav__primary-link', { 'nav__link--active': active })}
            >
              <Button noStyle navigate={path} label={label} icon={icon} />
            </li>
          ))}
        </ul>
        <hr />
        <ul className="nav__secondary">
          {navLinks.secondary.map(({ label, path, active, icon, subLinks = [] }, index) => (
            <li
              key={index}
              className={classnames('nav__link nav__secondary-link', {
                'nav__link--active': active && !subLinks.length,
              })}
            >
              <Button noStyle navigate={path} label={label} icon={icon} />
              {!!subLinks.length &&
                active && (
                  <ul>
                    {subLinks.map(({ label, path, active }, index) => (
                      <li
                        key={index}
                        className={classnames('nav__link nav__sub-link', {
                          'nav__link--active': active,
                        })}
                      >
                        <Button noStyle navigate={path} label={label} />
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavigationElements;
