import BookShelf from "./interface/Bookshelf"; 
import Cashier from "./interface/Cashier";
import "./BgInterface.css";

function BgInterface() {

    function handleClick() {
        console.log("hello");
    }

    return (
        <div className="bg-interface">
            <BookShelf className={"bookshelf-one"} handleClick={handleClick} />
            <BookShelf className={"bookshelf-two"} handleClick={handleClick}/>
            <BookShelf className={"bookshelf-three"} handleClick={handleClick}/>
            <Cashier className={"cashier"} />
        </div>
    )
}

export default BgInterface;