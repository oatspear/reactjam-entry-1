import bookshelf from "../../assets/bookshelf.png";

function BookShelf({ className, handleClick }) {
    return (
        <div className={className} onClick={handleClick}>
            <img src={bookshelf} />
        </div>
    )
}

export default BookShelf;