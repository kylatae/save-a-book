import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import { useMutation } from '@apollo/client';

import { useQuery } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // needs an auth check to see the user is logged in before GET_ME works
  const token = Auth.loggedIn() ? Auth.getToken() : null;
  const {loading, data} = useQuery(GET_ME)

  //data comes out as .me and needs to be set inside that tree straight to user for how this website is built.
  const userData = data?.me || []
  const userDataLength = userData?.bookCount || ""

  const [removeBook] = useMutation(REMOVE_BOOK)


  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const {data} = await removeBook({
        variables: {bookId}
      })
      console.log(data)
      if (!data) {
        throw new Error('something went wrong!');
      }
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
      window.location.reload(true)
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (!userDataLength) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => {
            return (
              // Added in a TON of bookId keys to make it so there were no children duplicates
              <Col key={`col${book.bookId}`} md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? <Card.Img key={`img${book.bookId}`} src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body key={`body${book.bookId}`}>
                    <Card.Title key={`title${book.bookId}`}>{book.title}</Card.Title>
                    <p key={`p${book.bookId}`} className='small'>Authors: {book.authors}</p>
                    <Card.Text key={`text${book.bookId}`}>{book.description}</Card.Text>
                    <Button key={`delete${book.bookId}`} className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
