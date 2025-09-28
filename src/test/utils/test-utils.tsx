import React from 'react';
import { render } from '@testing-library/react';

const customRender = (ui, options) => {
  const Wrapper = ({ children }) => (
    <React.Fragment>{children}</React.Fragment>
  );
  return render(ui, { wrapper: Wrapper, ...options });
};

export * from '@testing-library/react';
export { customRender as render };