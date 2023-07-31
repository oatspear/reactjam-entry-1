// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useState } from "react";
import {DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import iconDragDrop from "../../assets/dragdrop.png";
import iconBook1 from "../../assets/book1.png";
// import iconBook2 from "../../assets/book2.png";
// import iconBook3 from "../../assets/book3.png";
// import iconBook4 from "../../assets/book4.png";
import iconBag from "../../assets/bag.png";
import "./SellBooks.css";
import { playSound } from "../../sounds";


// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------


function Draggable(props: any): JSX.Element {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: "book-being-sold",
  });
  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div className="book" ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <img className="animate__animated animate__pulse" src={iconBook1} />
      {props.children}
    </div>
  )
}


function Droppable(): JSX.Element {
  const {isOver, setNodeRef} = useDroppable({
    id: "book-sale-bag",
  });
  const style = {
    opacity: isOver ? 1 : 0.5,
  };

  return (
    <div className="bag" ref={setNodeRef} style={style}>
      <img className="animate__animated animate__pulse" src={iconBag} />
    </div>
  );
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
    // cancelTask();

    return (
      <div onClick={cancelTask}>
        <h1 className="animate__animated animate__tada">Done!</h1>
      </div>
    )
  }


  function handleDragEnd({ over }: { over: any}) {
    if (over != null) {
      const done = handledBooks + 1;
      setHandledBooks(done);
      playSound("woosh");
      if (done >= amount) {
        Rune.actions.completeBookPurchase({ amount });
        cancelTask();
      }
    }
  }

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));


  // <IconLabel icon={iconBooks} label={remaining.toString()} />
  // <IconLabel icon={iconClock} label={timer.toString()} />
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="task-handler sell-books">
        <div className="book-column">
          <Draggable />
          <p>{ remaining }</p>
        </div>
        <div className="filler">
          <img className="animate__animated animate__slideOutRight" src={iconDragDrop} />
        </div>
        <div className="bag-column">
          <Droppable />
          <p>{ handledBooks }</p>
        </div>
      </div>
    </DndContext>
  );
}

export default SellBooks;