// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import React, { useState } from "react";
import iconDragDrop from "../../assets/dragdrop.png";
import iconBook1 from "../../assets/book1.png";
import iconBook2 from "../../assets/book2.png";
import iconBook3 from "../../assets/book3.png";
// import iconBook4 from "../../assets/book4.png";
import "./SortByAuthor.css";
import { BookGenre, GENRE_FANTASY, GENRE_POETRY } from "../../logic";


// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------


function onDragBook(e: React.DragEvent<HTMLDivElement>, author: string) {
  e.dataTransfer.setData("text/plain", author);
  e.dataTransfer.dropEffect = "move";
}


function allowDrop(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
}


function isSameOrder(current: Array<string | undefined>, expected: string[]): boolean {
  return current.toString() === expected.toString()
}


function emptyArray(length: number): Array<undefined> {
  const a = [];
  for (let i = length; i > 0; --i) { a.push(undefined) }
  return a;
}


// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------


interface SortByAuthorProps {
  genre: BookGenre;
  authors: string[];
  cancelTask: () => void;
}


function SortByAuthor({ genre, authors, cancelTask }: SortByAuthorProps): JSX.Element {
  const correctOrder = authors.slice().sort();

  const [handledBooks, setHandledBooks] = useState<Array<string | undefined>>(emptyArray(authors.length));

  if (isSameOrder(handledBooks, correctOrder)) {
    return (
      <div onClick={cancelTask}>
        <h1 className="animate__animated animate__tada">Done!</h1>
      </div>
    )
  }

  const iconSrc: string = (
    genre === GENRE_FANTASY
    ? iconBook2
    : genre == GENRE_POETRY
    ? iconBook1
    : iconBook3
  );


  const onDropBook = (e: React.DragEvent<HTMLDivElement>, i: number) => {
    e.preventDefault();
    const author = e.dataTransfer.getData("text/plain");
    const newOrder = handledBooks.slice();
    for (const k of newOrder.keys()) {
      if (newOrder[k] === author) {
        newOrder[k] = undefined;
        break;
      }
    }
    newOrder[i] = author;
    setHandledBooks(newOrder);
    if (isSameOrder(newOrder, correctOrder)) {
      const sorted: string[] = newOrder as string[];
      Rune.actions.sortBookshelf({ genre, sorted });
      cancelTask();
      console.log("close task");
    }
  }

  return (
    <div className="task-handler sort-by-author">
      <div className="book-list">{
        authors.map((author, i) => (
          <div key={i} className="item">
            <p className="label">{ author }</p>
            <div className="book" draggable="true" onDragStart={e => onDragBook(e, author)}>
              <img className="animate__animated animate__pulse" src={iconSrc} />
            </div>
          </div>
        ))
      }
      </div>
      <div className="filler">
        <img className="animate__animated animate__slideOutRight" src={iconDragDrop} />
        <p>A - Z</p>
      </div>
      <div className="drop-list">{
        handledBooks.map((author, i) => (
          <div key={i} className="item">
            <div className="drop" onDrop={e => onDropBook(e, i)} onDragOver={allowDrop}>
              {
                author != null
                ? <img className="animate__animated animate__pulse" src={iconSrc} />
                : <div className="placeholder"></div>
              }
            </div>
            <p className="label">{ author || (i+1).toString() }</p>
          </div>
        ))
      }
      </div>
    </div>
  );
}

export default SortByAuthor;
