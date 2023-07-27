import pile from "../../assets/books.png";

function BookPile ({ className, handleClick }) {
    return (
        <div className={className} onClick={handleClick}>
            <img src={pile} />
        </div>
    )
}

export default BookPile;