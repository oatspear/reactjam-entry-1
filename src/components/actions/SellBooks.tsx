import { useState } from "react";
import { BookGenre } from "../../logic";

interface SellBooksProps {
  books: Array<BookGenre>;
  timer: number;
}


function SellBooks({ books, timer }: SellBooksProps): JSX.Element {
  const [sliderValue, setSliderValue] = useState(0);

  return (
    <div>
      {
        timer > 0
        ? books
        : "Failed"
      }
      <span>{ sliderValue }</span>
      <button>Close</button>
    </div>
  );
}

export default SellBooks;