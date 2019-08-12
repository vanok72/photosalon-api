import express from 'express';
import request from 'request-promise';
import { parseString } from 'xml2js';
import authenticate from '../middlwares/authenticate';
import book from '../models/book';
import parseErrors from '../utils/parseErrors';

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  book.find({ userId: req.currentUser._id }).then(books => res.json({ books }));
});

router.post('/', (req, res) => {
  book
    .create({ ...req.body.book, userId: req.currentUser._id })
    .then(book => res.json({ book }))
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

router.get('/search', (req, res) => {
  request
    .get(
      `https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_KEY}&q=${req.query.q}`,
    )
    .then(result =>
      parseString(result, (err, goodreadsResult) =>
        res.json({
          books: goodreadsResult.GoodreadsResponse.search[0].results[0].work.map(
            work => ({
              goodreadsId: work.best_book[0].id[0]._,
              title: work.best_book[0].title[0],
              authors: work.best_book[0].author[0].name[0],
              covers: [work.best_book[0].image_url[0]],
            }),
          ),
        }),
      ),
    );
  // res.userEmail
  // res.json({
  //   books: [
  //     {
  //       goodreadsId: 1,
  //       title: '1984',
  //       authors: 'Orwell',
  //       covers: [
  //         'https://images.pexels.com/photos/67636/rose-blue-flower-rose-blooms-67636.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
  //         'https://helpx.adobe.com/content/dam/help/en/stock/how-to/visual-reverse-image-search/jcr_content/main-pars/image/visual-reverse-image-search-v2_intro.jpg',
  //       ],
  //       pages: 198,
  //     },
  //     {
  //       goodreadsId: 2,
  //       title: 'Three Men in a Boat',
  //       authors: 'Jerome',
  //       covers: [
  //         'https://www.w3schools.com/howto/img_forest.jpg',
  //         'https://static.addtoany.com/images/dracaena-cinnabari.jpg',
  //       ],
  //       pages: 256,
  //     },
  //   ],
  // });
});

router.get('/fetchPages', (req, res) => {
  const goodreadsId = req.query.goodreadsId;

  request
    .get(
      `https://www.goodreads.com/book/show.xml?key=${process.env.GOODREADS_KEY}&id=${goodreadsId}`,
    )
    .then(result =>
      parseString(result, (err, goodreadsResult) => {
        const numPages = goodreadsResult.GoodreadsResponse.book[0].num_pages[0];
        const pages = numPages ? parseInt(numPages, 10) : 0;
        res.json({
          pages,
        });
      }),
    );
});

export default router;
