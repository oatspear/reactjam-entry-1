// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { RuneClient } from "rune-games-sdk/multiplayer";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export type TaskType = 1 | 2;

function constTaskTypeBookPurchase(): TaskType { return 1 }


export type BookGenre = 0 | 1 | 2;

function constBookGenreFantasy(): BookGenre { return 0 }
function constBookGenrePoetry(): BookGenre { return 1 }
function constBookGenreRomance(): BookGenre { return 2 }

function allBookGenres(): Array<BookGenre> {
  return [0, 1, 2];
}


// Gameplay Constants

function constMaxPendingTasks(): number { return 10 }
function constShelfCapacity(): number { return 12 }


// -----------------------------------------------------------------------------
// Player State
// -----------------------------------------------------------------------------


export interface PlayerState {
  id: string;
  score: number;
}


function newPlayer(id: string): PlayerState {
  return { id, score: 0 };
}


// -----------------------------------------------------------------------------
// Books
// -----------------------------------------------------------------------------


export interface Book {
  id: number;
  author: string;
  genre: BookGenre;
}


function newBook(id: number, author: string, genre: BookGenre): Book {
  return { id, author, genre };
}


export interface Bookshelf {
  genre: BookGenre;
  books: Array<Book>;
  lastSortedAt: number;
}


function newBookShelf(genre: BookGenre): Bookshelf {
  return { genre, books: [], lastSortedAt: 0 };
}


// -----------------------------------------------------------------------------
// Player Tasks
// -----------------------------------------------------------------------------


export interface Task {
  id: number;
  type: TaskType;
  timeout: number;
  timer: number;
}


export interface BookTask extends Task {
  books: Array<Book>;
}


function newBookPurchase(id: number, timeout: number, books: Array<Book>): BookTask {
  return {
    id,
    type: constTaskTypeBookPurchase(),
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
  generatedBooks: number;
  // Pending player tasks
  tasks: Array<Task>;
  lastTaskCreatedAt: number;
  // Books and bookshelves
  bookshelves: Array<Bookshelf>;
  lostBooks: Array<Book>;  // books to put back on shelves
}


function generateBook(game: GameState): Book {
  const id: number = ++game.generatedBooks;
  const r: number = Math.random();
  const genre: BookGenre = ((r * 3) | 0) as BookGenre;
  const author: string = String.fromCharCode(65 + ((r * 26) | 0));
  return newBook(id, author, genre);
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
  const books: Array<Book> = [generateBook(game)]  // FIXME
  switch (t) {
    case constTaskTypeBookPurchase():
      return addNewTask(game, newBookPurchase(id, timeout, books));
  }
}


function processFailedTask(game: GameState, task: Task): void {
  switch (task.type) {
    case constTaskTypeBookPurchase():
      // all books the client was holding must now be put back on shelves
      game.lostBooks = game.lostBooks.concat((task as BookTask).books);
      break;
  }
}


function updateTaskTimers(game: GameState): void {
  const tasks = game.tasks;
  for (let i = tasks.length - 1; i >= 0; --i) {
    tasks[i].timer--;
    if (tasks[i].timer < 0) {
      // tasks are always sorted based on time left to complete them
      // it is safe to discard all tasks below the last expired task
      const failedTasks: Array<Task> = tasks.splice(0, i+1);
      for (const failedTask of failedTasks) {
        processFailedTask(game, failedTask);
      }
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

type GameActions = {
  completeTask: (params: { id: number }) => void;
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
      generatedBooks: 0,
      tasks: [],
      lastTaskCreatedAt: 0,
      bookshelves: allBookGenres().map(newBookShelf),
      lostBooks: [],
    };
    for (const id of allPlayerIds) {
      game.players[id] = newPlayer(id);
    }
    return game;
  },

  update: ({ game }) => {
    if (game.timer <= 0) {
      const scores: Record<string, number> = {};
      for (const p of Object.values(game.players)) {
        const player = p as PlayerState;
        scores[player.id] = player.score;
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
    completeTask: ({ id }, { game, playerId }) => {
      for (const i of game.tasks.keys()) {
        const task = game.tasks[i];
        if (task.id !== id) { continue }
        // remove the completed task
        game.tasks.splice(i, 1);
        // add to the global and the player's score
        game.score += 10;  // TODO
        game.players[playerId].score += 10;
        return;
      }
    }
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