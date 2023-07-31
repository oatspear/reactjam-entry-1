// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { useState } from "react";
import {DndContext, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors} from '@dnd-kit/core';
import {CSS} from '@dnd-kit/utilities';
import iconDragDrop from "../../assets/dragdrop.png";
import iconBook1 from "../../assets/book1.png";
import iconBook2 from "../../assets/book2.png";
import iconBook3 from "../../assets/book3.png";
// import iconBook4 from "../../assets/book4.png";
import "./SortByAuthor.css";
import { BookGenre, GENRE_FANTASY, GENRE_POETRY } from "../../logic";
import { playSound } from "../../sounds";


// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------


interface DraggableProps {
  index: number;
  author: string;
  iconSrc: string;
  children?: any;
}


function Draggable(props: DraggableProps): JSX.Element {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `book-being-sorted-${props.index}`,
    data: {
      author: props.author,
    },
  });
  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div className="book" ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <img className="animate__animated animate__pulse" src={props.iconSrc} />
      {props.children}
    </div>
  )
}


interface DroppableProps {
  index: number;
  author: string | undefined;
  iconSrc: string;
}


function Droppable(props: DroppableProps): JSX.Element {
  const {isOver, setNodeRef} = useDroppable({
    id: `author-sorting-slot-${props.index}`,
    data: {
      index: props.index,
    },
  });
  const style = {
    opacity: isOver || !!props.author ? 1 : 0.5,
  };

  return (
    <div className="drop" ref={setNodeRef} style={style}>{
      props.author != null
      ? <img className="animate__animated animate__pulse" src={props.iconSrc} />
      : <div className="placeholder"></div>
    }</div>
  );
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


  function handleDragEnd(event: any) {
    const {active, over} = event;
    if (over == null) { return }

    const author = active.data.current.author;
    const newOrder = handledBooks.slice();
    for (const k of newOrder.keys()) {
      if (newOrder[k] === author) {
        newOrder[k] = undefined;
        break;
      }
    }
    newOrder[over.data.current.index] = author;
    setHandledBooks(newOrder);
    playSound("thump");
    if (isSameOrder(newOrder, correctOrder)) {
      const sorted: string[] = newOrder as string[];
      Rune.actions.sortBookshelf({ genre, sorted });
      cancelTask();
    }
  }


  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="task-handler sort-by-author">
        <div className="book-list">{
          authors.map((author, i) => (
            <div key={i} className="item">
              <p className="label">{ author }</p>
              <Draggable index={i} author={author} iconSrc={iconSrc} />
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
              <Droppable index={i} author={author} iconSrc={iconSrc} />
              <p className="label">{ author || (i+1).toString() }</p>
            </div>
          ))
        }
        </div>
      </div>
    </DndContext>
  );
}

export default SortByAuthor;
