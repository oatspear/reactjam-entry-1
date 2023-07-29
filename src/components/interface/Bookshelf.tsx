import bookshelf from "../../assets/bookshelf.png";


interface BookShelfProps {
  className: string;
  handleClick: (e: React.MouseEvent | React.TouchEvent) => void;
};


function BookShelf({ className, handleClick }: BookShelfProps): JSX.Element {
  return (
    <div className={className} onClick={handleClick}>
      <img src={bookshelf} />
    </div>
  )
}


export default BookShelf;
