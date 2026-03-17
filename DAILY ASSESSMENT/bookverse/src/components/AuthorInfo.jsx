import React, { Component } from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';

class AuthorInfo extends Component {
  componentDidMount() {
    console.log(`Author data for ${this.props.authorName} loaded successfully.`);
  }

  render() {
    const { authorName, bio, topBooks, onClose } = this.props;

    return (
      <Card className="mt-4 border-primary bg-dark text-white shadow">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">About the Author: {authorName}</h5>
          <Button variant="outline-light" size="sm" onClick={onClose}>Close</Button>
        </Card.Header>
        <Card.Body>
          <Card.Text className="lead fs-6 mb-4">{bio}</Card.Text>
          <h6 className="text-primary mb-3 text-uppercase fw-bold letter-spacing-1" style={{ fontSize: '0.8rem' }}>Top Works</h6>
          <ListGroup variant="flush">
            {topBooks.map((book, index) => (
              <ListGroup.Item key={index} className="bg-transparent text-white-50 border-secondary px-0 py-2">
                • {book}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    );
  }
}

export default AuthorInfo;
