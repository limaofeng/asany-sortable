import React from 'react';
import * as ReactDOM from 'react-dom';

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<span />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
