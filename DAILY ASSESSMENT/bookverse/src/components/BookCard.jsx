import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import PropTypes from 'prop-types';

const BookCard = ({ book, layout, onAuthorClick }) => {
  const isList = layout === 'list';

  return (
    <Card 
      className={`h-100 border-secondary bg-dark text-white overflow-hidden shadow-sm book-card-hover ${isList ? 'flex-row align-items-center' : ''}`}
    >
      <div 
        className="bg-black d-flex justify-content-center align-items-center overflow-hidden"
        style={{ width: isList ? '200px' : '100%', height: isList ? '250px' : '280px', flexShrink: 0 }}
      >
        <Card.Img 
          variant={isList ? 'left' : 'top'} 
          src={book.cover} 
          alt={book.title} 
          className="book-cover-img w-100 h-100 object-fit-cover"
        />
      </div>
      <Card.Body className="d-flex flex-column p-4">
        <div className="mb-2">
          <Badge bg="primary" className="mb-2 text-uppercase fw-normal letter-spacing-1" style={{ fontSize: '0.7rem' }}>Bestseller</Badge>
          <Card.Title className="fw-bold fs-5 mb-1">{book.title}</Card.Title>
          <Card.Subtitle 
            className="mb-3 text-primary author-link" 
            style={{ fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => onAuthorClick(book)}
          >
            by {book.author}
          </Card.Subtitle>
        </div>
        
        {isList && (
           <Card.Text className="text-secondary small mb-3 flex-grow-1">
             {book.description ? book.description : 'A captivating journey into the world of literature.'}
           </Card.Text>
        )}
        
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="fw-bolder fs-5 text-success">${book.price.toFixed(2)}</span>
          <Button variant="outline-light" size={isList ? 'md' : 'sm'} className="px-3 fw-medium add-btn">
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    cover: PropTypes.string.isRequired,
    description: PropTypes.string,
    authorBio: PropTypes.string,
    topBooks: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  layout: PropTypes.string.isRequired,
  onAuthorClick: PropTypes.func.isRequired
};

export default BookCard;
