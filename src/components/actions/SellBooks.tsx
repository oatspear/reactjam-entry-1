import React, { useEffect, useState } from "react";
import "./SellBooks.css";
import IconLabel from "../IconLabel";
import iconDragDrop from "../../assets/dragdrop.png";
import iconBook1 from "../../assets/book1.png";
// import iconBook2 from "../../assets/book2.png";
// import iconBook3 from "../../assets/book3.png";
// import iconBook4 from "../../assets/book4.png";
import iconBag from "../../assets/bag.png";
import iconBooks from "../../assets/books.png";
import iconClock from "../../assets/clock.png";

interface SellBooksProps {
  amount: number;
  timer: number;
  cancelTask: () => void;
}


function SellBooks({ amount, timer, cancelTask }: SellBooksProps): JSX.Element {
  const [handledBooks, setHandledBooks] = useState<number>(0);

  // useEffect(() => setHandledBooks(0), [task]);

  if (timer <= 0) {
    setHandledBooks(0);
    return (
      <div onClick={cancelTask}>
        <h1>Time's Up!</h1>
      </div>
    )
  }

  const remaining = amount - handledBooks;

  if (remaining <= 0) {
    setHandledBooks(0);
    // Rune.actions.completeBookPurchase({ amount });
    cancelTask();

    // className="animate__animated animate__tada"
    return (
      <div onClick={cancelTask}>
        <h1>Done!</h1>
      </div>
    )
  }

  function onDragBook(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData("text/plain", "sale");
    e.dataTransfer.dropEffect = "move";
  }

  function onDropBook(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    // const data = e.dataTransfer.getData("text/plain");
    const done = handledBooks + 1;
    setHandledBooks(done);
    if (done >= amount) {
      Rune.actions.completeBookPurchase({ amount });
    }
  }

  function allowDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="task-handler sell-books">
      <div className="status-bar">
        <IconLabel icon={iconBooks} label={remaining.toString()} />
        <button onClick={cancelTask}>Cancel</button>
        <IconLabel icon={iconClock} label={timer.toString()} />
      </div>

      <div className="content">
        <div className="book">
          <img className="animate__animated animate__pulse"
            src={iconBook1}
            draggable="true"
            onDragStart={onDragBook} />
        </div>
        <div className="filler">
          <img className="animate__animated animate__slideOutRight" src={iconDragDrop} />
        </div>
        <div className="bag">
          <img className="animate__animated animate__pulse"
            src={iconBag}
            onDrop={onDropBook}
            onDragOver={allowDrop} />
        </div>
      </div>
    </div>
  );
}

export default SellBooks;