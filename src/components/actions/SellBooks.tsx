// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import iconDragDrop from "../../assets/dragdrop.png";
import iconBook1 from "../../assets/book1.png";
// import iconBook2 from "../../assets/book2.png";
// import iconBook3 from "../../assets/book3.png";
// import iconBook4 from "../../assets/book4.png";
import iconBag from "../../assets/bag.png";
import "./SellBooks.css";


// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------


function onDragBook(e: React.DragEvent<HTMLDivElement>) {
  // e.dataTransfer.setData("text/plain", "sale");
  e.dataTransfer.dropEffect = "move";
}


function allowDrop(e: React.DragEvent<HTMLDivElement>) {
  e.preventDefault();
}


// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------


interface SellBooksProps {
  amount: number;
  cancelTask: () => void;
}


function SellBooks({ amount, cancelTask }: SellBooksProps): JSX.Element {
  const [handledBooks, setHandledBooks] = useState<number>(0);

  const remaining = amount - handledBooks;

  if (remaining <= 0) {
    // setHandledBooks(0);
    // Rune.actions.completeBookPurchase({ amount });
    cancelTask();

    // className="animate__animated animate__tada"
    return (
      <div onClick={cancelTask}>
        <h1>Done!</h1>
      </div>
    )
  }


  const onDropBook = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // const data = e.dataTransfer.getData("text/plain");
    const done = handledBooks + 1;
    setHandledBooks(done);
    if (done >= amount) {
      Rune.actions.completeBookPurchase({ amount });
    }
  }


  // <IconLabel icon={iconBooks} label={remaining.toString()} />
  // <IconLabel icon={iconClock} label={timer.toString()} />
  return (
    <div className="task-handler sell-books">
      <div className="book-column">
        <div className="book" draggable="true" onDragStart={onDragBook}>
          <img className="animate__animated animate__pulse" src={iconBook1} />
        </div>
        <p>{ remaining }</p>
      </div>
      <div className="filler">
        <img className="animate__animated animate__slideOutRight" src={iconDragDrop} />
      </div>
      <div className="bag-column">
        <div className="bag" onDrop={onDropBook} onDragOver={allowDrop}>
          <img className="animate__animated animate__pulse" src={iconBag} />
        </div>
        <p>{ handledBooks }</p>
      </div>
    </div>
  );
}

export default SellBooks;