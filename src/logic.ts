// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { RuneClient } from "rune-games-sdk/multiplayer"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export type TaskType = 1 | 2;


function constTaskTypeBookPurchase() { return 1 }
function constTaskTypeBookReturn() { return 2 }


// -----------------------------------------------------------------------------
// Player State
// -----------------------------------------------------------------------------


export interface PlayerState {
  id: string;
  score: number;
}


function newPlayer(id: string): PlayerState {
  return {
    id,
    score: 0,
  };
}


// -----------------------------------------------------------------------------
// Client Tasks
// -----------------------------------------------------------------------------


export interface Task {
  id: string;
  type: TaskType;
  timeout: number;
  timer: number;
}


export interface BookTask extends Task {
  books: number;
}


function newBookPurchase(num: number, timeout: number, books: number): BookTask {
  return {
    id: num.toString(),
    type: constTaskTypeBookPurchase(),
    timeout,
    timer: timeout,
    books,
  };
}


function newBookReturn(num: number, timeout: number, books: number): BookTask {
  return {
    id: num.toString(),
    type: constTaskTypeBookReturn(),
    timeout,
    timer: timeout,
    books,
  };
}


// -----------------------------------------------------------------------------
// Game State
// -----------------------------------------------------------------------------


export interface GameState {
  count: number;
  // General properties
  players: Record<string, PlayerState>;
  score: number;
  timer: number;
  // Pending player tasks
  tasks: Array<Task>;
  lastTaskCreatedAt: number;
  clientsPurchasing: Array<number>;   // clients waiting to purchase books
  clientsReturning: Array<number>;    // clients waiting to return books
  bookshelves: Array<Array<number>>;  // books on shelves
  booksToReplace: Array<number>;      // books to return to shelves
}

type GameActions = {
  increment: (params: { amount: number }) => void;
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


function generateNewTask(game) {
  // use randomness to determine task type
  // use sorted insertion based on remaining time
}


function onGameTick(game) {
  game.timer--;

  const tasks = game.tasks;
  for (let i = tasks.length - 1; i >= 0; --i) {
    tasks[i]--;
    if (tasks[i] < 0) {
      // tasks are always sorted based on time left to complete them
      // it is safe to discard all tasks below the last expired task
      decreaseScore(game, (i+1) * 10);
      tasks.splice(0, i+1);
      break;
    }
  }

  // use randomness to determine whether a new task will be generated
  // use number of players and game.lastTaskCreatedAt to influence decision
  const now = Rune.gameTimeInSeconds();
  const reliefPeriod = now - game.lastTaskCreatedAt;
  generateNewTask(game);
}


// -----------------------------------------------------------------------------
// Rune Steup
// -----------------------------------------------------------------------------

declare global {
  const Rune: RuneClient<GameState, GameActions>;
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
      tasks: [],
      lastTaskCreatedAt: 0,
      clientsPurchasing: [],
      clientsReturning: [],
      bookshelves: [],
      booksToReplace: [],
    };
    for (const id of allPlayerIds) {
      state.players[id] = newPlayer(id);
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
      game.count++;
      game.clientsPurchasing.push(10);
      game.tasks.push(newBookPurchase(game.count, 10, 3));
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
