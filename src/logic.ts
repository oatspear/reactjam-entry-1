// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { RuneClient } from "rune-games-sdk/multiplayer";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export type TaskType = 1 | 2;


function constTaskTypeBookPurchase(): TaskType { return 1 }
function constTaskTypeBookReturn(): TaskType { return 2 }


function constMaxPendingTasks(): number { return 10 }


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
  generatedTasks: number;
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


function addNewTask(game: GameState, task: Task): void {
  // sorted insertion of new task
  const t = task.timer;
  const tasks = game.tasks;
  const n = tasks.length;
  // perform small optimizations to avoid splice
  if (n === 0) {
    tasks.push(task);
  } else {
    if (tasks[n-1].timer <= t) {
      // the new task is the last to expire
      tasks.push(task);
    } else if (tasks[0].timer > t) {
      // the new task is the first to expire
      tasks.unshift(task);
    } else {
      for (let i = tasks.length - 2; i >= 0; --i) {
        if (tasks[i].timer <= t) {
          // this task will expire sooner than the new one
          // insert after this point
          tasks.splice(i+1, 0, task);
          return;
        }
      }
    }
  }
}


function generateNewTask(game: GameState): void {
  // prevent overflowing the game with tasks
  if (game.tasks.length > constMaxPendingTasks()) { return }

  // use randomness to determine whether a new task will be generated
  // use number of players and game.lastTaskCreatedAt to influence decision
  const numPlayers = Object.keys(game.players).length;
  const now = Rune.gameTimeInSeconds();
  const reliefPeriod = (now - game.lastTaskCreatedAt) | 0;
  const chance = 0.125 * numPlayers * reliefPeriod;
  const r = Math.random();
  if (r >= chance) { return }

  // use randomness to determine task type
  // use sorted insertion based on remaining time
  const id = ++game.generatedTasks;
  const timeout = 10 - numPlayers + 1;
  const t = (r * 2) | 0;
  switch (t) {
    case constTaskTypeBookPurchase():
      return addNewTask(game, newBookPurchase(id, timeout, 3));
    case constTaskTypeBookReturn():
      return addNewTask(game, newBookReturn(id, timeout, 3));
  }
}


function updateTaskTimers(game: GameState): void {
  const tasks = game.tasks;
  for (let i = tasks.length - 1; i >= 0; --i) {
    tasks[i].timer--;
    if (tasks[i].timer < 0) {
      // tasks are always sorted based on time left to complete them
      // it is safe to discard all tasks below the last expired task
      decreaseScore(game, (i+1) * 10);
      tasks.splice(0, i+1);
      break;
    }
  }
}


function onGameTick(game: GameState): void {
  // update the global timer
  game.timer--;

  // update individual task timers
  updateTaskTimers(game);

  // randomly generate new tasks
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
    const game: GameState = {
      count: 0,
      players: {},
      score: 0,
      timer: 300,
      generatedTasks: 0,
      tasks: [],
      lastTaskCreatedAt: 0,
      clientsPurchasing: [],
      clientsReturning: [],
      bookshelves: [],
      booksToReplace: [],
    };
    for (const id of allPlayerIds) {
      game.players[id] = newPlayer(id);
    }
    return game;
  },

  update: ({ game }) => {
    if (game.timer <= 0) {
      const scores = {};
      for (const p of Object.values(game.players)) {
        scores[(p as PlayerState).id] = (p as PlayerState).score;
      }
      Rune.gameOver({
        players: scores,
        delayPopUp: true,
      });
    } else {
      onGameTick(game);
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
    playerJoined: (playerId, { game }) => {
      game.players[playerId] = newPlayer(playerId);
    },

    playerLeft(playerId, { game }) {
      delete (game as GameState).players[playerId];
    },
  },
})