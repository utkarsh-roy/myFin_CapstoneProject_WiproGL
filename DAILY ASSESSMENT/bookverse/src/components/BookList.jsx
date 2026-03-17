import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import BookCard from './BookCard';

const BookList = ({ books, layout, onAuthorClick }) => {
  if (books.length === 0) {
    return (
      <Alert variant="secondary" className="text-center py-5 bg-dark border-secondary text-white-50 mt-4 rounded-4">
        <h4 className="fw-normal mb-0">No books found matching your search.</h4>
      </Alert>
    );
  }

  return (
    <Row className="g-4">
      {books.map(book => (
        <Col 
          key={book.id} 
          xs={12} 
          sm={layout === 'grid' ? 6 : 12} 
          md={layout === 'grid' ? 4 : 12} 
          lg={layout === 'grid' ? 3 : 10}
          xl={layout === 'grid' ? 3 : 8}
          className={layout === 'list' ? 'mx-auto' : ''}
        >
          <BookCard book={book} layout={layout} onAuthorClick={onAuthorClick} />
        </Col>
      ))}
    </Row>
  );
};

export default BookList;
