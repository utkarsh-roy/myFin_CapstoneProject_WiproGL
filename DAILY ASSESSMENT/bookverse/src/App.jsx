import { useState, useRef } from 'react';
import { Container, Row, Col, Navbar, InputGroup, Form, Button } from 'react-bootstrap';
import { mockBooks } from './data/books';
import BookList from './components/BookList';
import AuthorInfo from './components/AuthorInfo';

function App() {
  const [books] = useState(mockBooks);
  const [layoutMode, setLayoutMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  
  // Ref for search input focus
  const searchInputRef = useRef(null);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFocusSearch = () => {
    // Implementing refs (Uncontrolled Component principle for direct interaction)
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleAuthorClick = (book) => {
    setSelectedAuthor({
      name: book.author,
      bio: book.authorBio,
      topBooks: book.topBooks
    });
  };

  const handleCloseAuthorInfo = () => {
    setSelectedAuthor(null);
  };

  return (
    <div className="app-wrapper bg-dark text-white min-vh-100 pb-5">
      <Navbar bg="dark" variant="dark" expand="lg" className="border-bottom border-secondary mb-4 sticky-top shadow-sm px-4">
        <Container fluid>
          <Navbar.Brand href="#home" className="d-flex align-items-center gap-2 text-primary fw-bold" style={{ fontSize: '1.5rem' }}>
            <BookIcon />
            <span className="brand-text">BookVerse</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
             <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
               {/* Quick Focus Button */}
              <Button variant="outline-primary" size="sm" onClick={handleFocusSearch}>
                Focus Search
              </Button>

              <InputGroup style={{ maxWidth: '350px' }}>
                <InputGroup.Text className="bg-secondary border-0 text-white">
                  <SearchIcon />
                </InputGroup.Text>
                <Form.Control
                  ref={searchInputRef}
                  placeholder="Search by title or author..."
                  aria-label="Search Box"
                  className="bg-secondary text-white border-0 shadow-none search-input-override"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <div className="bg-secondary rounded p-1 d-flex gap-1 border border-dark">
                <Button 
                  variant={layoutMode === 'grid' ? 'primary' : 'link'} 
                  className={`text-decoration-none px-2 py-1 ${layoutMode !== 'grid' ? 'text-white-50' : 'text-white'}`}
                  onClick={() => setLayoutMode('grid')}
                  size="sm"
                >
                  <GridIcon />
                </Button>
                <Button 
                  variant={layoutMode === 'list' ? 'primary' : 'link'} 
                  className={`text-decoration-none px-2 py-1 ${layoutMode !== 'list' ? 'text-white-50' : 'text-white'}`}
                  onClick={() => setLayoutMode('list')}
                  size="sm"
                >
                  <ListIcon />
                </Button>
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Row className="mb-5 text-center mt-4">
          <Col lg={8} className="mx-auto">
            <h1 className="fw-bolder display-5 text-light mb-3">Welcome to BookVerse: Your Next Great Read Awaits</h1>
            <p className="text-secondary lead">Discover popular titles and explore our diverse collection tailored for every kind of reader.</p>
          </Col>
        </Row>

        {/* Composable Component: AuthorInfo rendered based on state */}
        {selectedAuthor && (
          <Row className="mb-5 animate-fade-in">
            <Col lg={10} className="mx-auto">
              <AuthorInfo 
                authorName={selectedAuthor.name}
                bio={selectedAuthor.bio}
                topBooks={selectedAuthor.topBooks}
                onClose={handleCloseAuthorInfo}
              />
            </Col>
          </Row>
        )}

        <section className="featured-section">
          <div className="d-flex justify-content-between align-items-end border-bottom border-secondary pb-2 mb-4">
            <h2 className="m-0 fs-3 fw-semibold">Discover Collection</h2>
            <span className="text-muted small fw-medium">{filteredBooks.length} results</span>
          </div>
          
          {/* Composable Component Hierarchy */}
          <BookList books={filteredBooks} layout={layoutMode} onAuthorClick={handleAuthorClick} />
        </section>
      </Container>
    </div>
  );
}

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
);

export default App;
