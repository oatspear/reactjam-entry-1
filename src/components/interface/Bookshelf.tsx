import bookshelf from "../../assets/bookshelf.png";
import Person from "./Person";


interface BookShelfProps {
  person: number;
  handleClick: (e: React.MouseEvent | React.TouchEvent) => void;
}


function BookShelf({ person, handleClick }: BookShelfProps): JSX.Element {
  return (
    <div className="bookshelf">
      <img src={bookshelf} className="animate__animated animate__pulse" onClick={handleClick} />
      <Person which={person} />
    </div>
  )
}


export default BookShelf;
