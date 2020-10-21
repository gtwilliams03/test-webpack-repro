import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import 'normalize.css/normalize.css'
import 'bootstrap/scss/bootstrap.scss'
import 'bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css'
import s from './CoreLayout.scss'

import { Container, ListGroup } from 'react-bootstrap'

class CoreLayout extends React.Component {

  static propTypes = {
  }

  render () {
    return (
      <Container className={s.appLayout} fluid>
        <h2>Test Repro</h2>
        <p>This is a test.  This is only a test.</p>
        <h4>TO DO:</h4>
        <ListGroup>
        {[1, 2, 3].map(i => <ListGroup.Item key={`item-${i}`}>Testing - Item #{i}</ListGroup.Item>)}
        </ListGroup>
      </Container>
    )
  }
}

export default withRouter(CoreLayout)
