import type { RuneClient } from "rune-games-sdk/multiplayer"

export interface GameState {
  count: number;
  // General properties
  players: Record<string, string>;
  score: number;
  timer: number;
  // Pending player tasks
  clientsPurchasing: Array<number>;   // clients waiting to purchase books
  clientsReturning: Array<number>;    // clients waiting to return books
  bookshelves: Array<Array<number>>;  // books on shelves
  booksToReplace: Array<number>;      // books to return to shelves
}

type GameActions = {
  increment: (params: { amount: number }) => void;
}

declare global {
  const Rune: RuneClient<GameState, GameActions>
}

export function getCount(game: GameState) {
  return game.count;
}

function decreaseScore(game, amount) {
  game.score -= amount;
}

function tickClientTasks(game, tasks) {
  for (let i = tasks.length - 1; i >= 0; --i) {
    tasks[i]--;
    if (tasks[i] < 0) {
      decreaseScore(game, (i+1) * 10);
      tasks.splice(0, i+1);
      break;
    }
  }
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,

  setup: (allPlayerIds: Array<string>): GameState => {
    const state = {
      count: 0,
      players: {},
      score: 0,
      timer: 300,
      clientsPurchasing: [],
      clientsReturning: [],
      bookshelves: [],
      booksToReplace: [],
    };
    for (const id of allPlayerIds) {
      state.players[id] = id;
    }
    return state;
  },

  update: ({ game }) => {
    if (game.timer <= 0) {
      Rune.gameOver({
        players: Object.keys(game.players).reduce((obj, id) => {
          obj[id] = "LOST";
          return obj;
        }, {}),
        delayPopUp: true,
      });
    } else {
      // Rune.gameTimeInSeconds()
      game.timer--;
      tickClientTasks(game, game.clientsPurchasing);
      tickClientTasks(game, game.clientsReturning);
    }
  },

  actions: {
    increment: ({ amount }, { game, playerId }) => {
      game.count += amount;
    },

    addPendingPurchase: (_nothing, {game, playerId}) => {
      // a client that waits 10 seconds
      game.clientsPurchasing.push(10);
    },
  },

  events: {
    playerJoined: () => {
      // Handle player joined
    },

    playerLeft() {
      // Handle player left
    },
  },
})
