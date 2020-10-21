import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { ConnectedRouter } from 'connected-react-router'
import { Provider } from 'react-redux'
import { history } from '../store/createStore'
import CoreLayout from '../layouts/CoreLayout'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faUsers } from '@fortawesome/free-solid-svg-icons'

library.add(fab, faUsers)

class AppContainer extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  }

  shouldComponentUpdate() {
    return false
  }

  componentDidMount() {
  }

  render () {
    const { store } = this.props
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <CoreLayout />
        </ConnectedRouter>
      </Provider>
    )
  }
}

export default AppContainer
