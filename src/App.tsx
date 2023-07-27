import { useEffect, useState } from "react";
import "./App.css";
import { GameState } from "./logic.ts";
import HUD from "./components/HUD.tsx";
import BgInterface from "./components/BgInterface.tsx";
import BookShelf from "./components/interface/Bookshelf.tsx";
import Cashier from "./components/interface/Cashier.tsx";
import BookPile from "./components/interface/BookPile.tsx";
import Person from "./components/interface/Person.tsx";
import Person2 from "./components/interface/Person2.tsx";

function App() {
  const [game, setGame] = useState<GameState>();

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, oldGame, yourPlayerId }) => {
        setGame(newGame);
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  const onButtonPress = () => {
    // const x = game.count > 3 ? -game.count : 1;
    // Rune.actions.increment({ amount: x });
    Rune.actions.addPendingPurchase();
  };

  function handleClick() {
    console.log("hello");
}

  return (
    <div className="bg-interface">
      <BookShelf className={"bookshelf-one"} handleClick={handleClick} />
      <BookShelf className={"bookshelf-two"} handleClick={handleClick}/>
      <BookShelf className={"bookshelf-three"} handleClick={handleClick}/>
      <BookPile className={"book-pile"} handleClick={handleClick} />
      <Cashier className={"cashier"} />
      <Person className={"person"} handleClick={handleClick} />
      <Person2 className={"person"} handleClick={handleClick} />
      <div className="card">
        <button onClick={onButtonPress}>
          count is {game.count}
        </button>
      </div>
      <HUD notifications={game.clientsPurchasing} score={game.score} timer={game.timer}>
      </HUD>
    </div>
  );
}

export default App;
