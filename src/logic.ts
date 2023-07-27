// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { RuneClient } from "rune-games-sdk/multiplayer";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export type TaskType = 1 | 2 | 3;

// function constTaskTypeBookPurchase(): TaskType { return 1 }

const TASK_TYPE_BOOK_PURCHASE: TaskType = 1;
const TASK_TYPE_BOOK_SORT_GENRE: TaskType = 2;
const TASK_TYPE_BOOK_SORT_AUTHOR: TaskType = 3;


export type BookGenre = 0 | 1 | 2;

// function constBookGenreFantasy(): BookGenre { return 0 }
// function constBookGenrePoetry(): BookGenre { return 1 }
// function constBookGenreRomance(): BookGenre { return 2 }

const NUM_GENRES: number = 3;

const GENRE_FANTASY: BookGenre = 0;
const GENRE_POETRY: BookGenre = 1;
const GENRE_ROMANCE: BookGenre = 2;

function allBookGenres(): Array<BookGenre> {
  return [GENRE_FANTASY, GENRE_POETRY, GENRE_ROMANCE];
}


// Gameplay Constants

// function constMaxPendingTasks(): number { return 10 }
// function constShelfCapacity(): number { return 12 }

const DEFAULT_TASK_ID: number = 0;
const MAX_PENDING_TASKS: number = 10;
const SHELF_CAPACITY: number = 30;
const DEFAULT_BOOK_SORT_TIMER: number = 5;


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


// -----------------------------------------------------------------------------
// Player Tasks
// -----------------------------------------------------------------------------


export interface Task {
  id: number;
  type: TaskType;
  timeout: number;
  timer: number;
}


export interface CounterTask extends Task {
  count: number;
}


export interface BookTask extends Task {
  books: Array<Book>;
}


function newBookPurchase(id: number, timeout: number, books: Array<Book>): BookTask {
  return {
    id,
    type: TASK_TYPE_BOOK_PURCHASE,
    timeout,
    timer: timeout,
    books,
  };
}


function newSortBooksByGenre(): BookTask {
  return {
    id: DEFAULT_TASK_ID,
    type: TASK_TYPE_BOOK_SORT_GENRE,
    timeout: DEFAULT_BOOK_SORT_TIMER,
    timer: DEFAULT_BOOK_SORT_TIMER,
    books: [],
  };
}


function newSortBooksByAuthor(): CounterTask {
  return {
    id: DEFAULT_TASK_ID,
    type: TASK_TYPE_BOOK_SORT_AUTHOR,
    timeout: DEFAULT_BOOK_SORT_TIMER,
    timer: DEFAULT_BOOK_SORT_TIMER,
    count: 0,
  };
}


function taskTimerBasedOnPlayers(game: GameState, basis: number): number {
  const t = basis - Object.keys(game.players).length + 1;
  return t <= 0 ? 1 : t;
}


// -----------------------------------------------------------------------------
// Book Shelves
// -----------------------------------------------------------------------------


export interface Bookshelf {
  genre: BookGenre;
  books: Array<Book>;
  sorting: CounterTask;
}


function newBookShelf(genre: BookGenre): Bookshelf {
  return { genre, books: [], sorting: newSortBooksByAuthor() };
}


// function takeBooksFromShelf(shelf: Bookshelf, amount: number): Array<Book> {
//   if (shelf.books.length <= amount) {
//     const books = shelf.books;
//     shelf.books = [];
//     shelf.sorting.count = 0;
//     return books;
//   }
//   const books = shelf.books.splice(-amount, amount);
//   shelf.sorting.count = Math.min(shelf.sorting.count, shelf.books.length);
//   return books;
// }


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
  lostZone: BookTask;  // books to put back on shelves
}


function generateBook(game: GameState, genre?: BookGenre): Book {
  const id: number = ++game.generatedBooks;
  const r: number = Math.random();
  const author: string = String.fromCharCode(65 + ((r * 26) | 0));
  genre = genre != null ? genre : ((r * NUM_GENRES) | 0) as BookGenre;
  return newBook(id, author, genre);
}


function moveBooksFromShelvesToLostZone(game: GameState): void {
  // random integer seed
  let r = (Math.random() * 1000000) | 0;
  const lost: Array<Book> = game.lostZone.books;
  for (const shelf of game.bookshelves) {
    // move between 0-2 books per shelf
    let howMany = r % 3;
    if (howMany === 0 || shelf.books.length === 0) { continue }

    // calculate which books to retrieve
    let books: Array<Book> = [];
    if (shelf.books.length <= howMany) {
      books = shelf.books;
      shelf.books = [];
    } else {
      for (; howMany > 0; howMany--) {
        const i = r % shelf.books.length;
        books.push(shelf.books[i]);
        shelf.books.splice(i, 1);
      }
    }

    // add books to the lost zone
    lost.splice(lost.length, 0, ...books);
    // regenerate a semi-random number
    r = (r * 31 + 17) % 1000000;
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
  if (game.tasks.length > MAX_PENDING_TASKS) { return }

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
    case TASK_TYPE_BOOK_PURCHASE:
      return addNewTask(game, newBookPurchase(id, timeout, books));
  }
}


function processCompletedTask(game: GameState, playerId: string, task: Task): void {
  let points: number = 0;
  const player: PlayerState = game.players[playerId];
  switch (task.type) {
    case TASK_TYPE_BOOK_PURCHASE:
      // all books the client was holding must now be put back on shelves
      game.lostZone.books = game.lostZone.books.concat((task as BookTask).books);
      points = 10 * (task as BookTask).books.length;
      break;
  }
  game.score += points;
  player.score += points;
}


function processFailedTask(game: GameState, task: Task): void {
  switch (task.type) {
    case TASK_TYPE_BOOK_PURCHASE:
      // all books the client was holding must now be put back on shelves
      game.lostZone.books = game.lostZone.books.concat((task as BookTask).books);
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

  // also update the sorting of bookshelves
  for (const shelf of game.bookshelves) {
    shelf.sorting.timer--;
    if (shelf.sorting.timer <= 0) {
      shelf.sorting.timer = shelf.sorting.timeout;
      shelf.sorting.count++;
    }
  }

  // also update the lost zone task
  game.lostZone.timer--;
  if (game.lostZone.timer <= 0) {
    game.lostZone.timer = game.lostZone.timeout;
    moveBooksFromShelvesToLostZone(game);
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


function generateInitialData(game: GameState): void {
  // generate books for the shelves
  for (const shelf of game.bookshelves) {
    for (let i = SHELF_CAPACITY; i > 0; --i) {
      shelf.books.push(generateBook(game, shelf.genre));
    }
  }
  // move some books to the lost zone
  moveBooksFromShelvesToLostZone(game);
  // calculate timers based on number of players
  regenerateTaskTimeouts(game);
}


function regenerateTaskTimeouts(game: GameState): void {
  // calculate timers based on number of players
  const t: number = taskTimerBasedOnPlayers(game, DEFAULT_BOOK_SORT_TIMER);
  // update book shelves
  for (const shelf of game.bookshelves) {
    shelf.sorting.timeout = t;
    shelf.sorting.timer = Math.min(t, shelf.sorting.timer);
  }
  // update lost zone
  game.lostZone.timeout = t;
  game.lostZone.timer = Math.min(t, game.lostZone.timer);
}


// -----------------------------------------------------------------------------
// Rune Steup
// -----------------------------------------------------------------------------


declare global {
  const Rune: RuneClient<GameState, GameActions>;
}


type GameActions = {
  completeTask: (params: { id: number }) => void;
  sortBookshelf: (params: { genre: BookGenre }) => void;
  sortLostZone: (params: { amount: number }) => void;
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
      lostZone: newSortBooksByGenre(),
    };
    for (const id of allPlayerIds) {
      game.players[id] = newPlayer(id);
    }
    generateInitialData(game);
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
        game.tasks.splice(i, 1);
        return processCompletedTask(game, playerId, task);
      }
      Rune.invalidAction();
    },

    sortBookshelf: ({ genre }, { game, playerId }) => {
      for (const shelf of game.bookshelves) {
        if (shelf.genre != genre) { continue }
        return processCompletedTask(game, playerId, shelf.sorting);
      }
      Rune.invalidAction();
    },

    sortLostZone: ({ amount }, { game, playerId }) => {
      if (game.lostZone.books.length >= amount) {
        return processCompletedTask(game, playerId, game.lostZone);
      }
      Rune.invalidAction();
    }
  },

  events: {
    playerJoined: (playerId, { game }) => {
      game.players[playerId] = newPlayer(playerId);
      // update task timers based on number of players
      regenerateTaskTimeouts(game);
    },

    playerLeft(playerId, { game }) {
      delete (game as GameState).players[playerId];
      // update task timers based on number of players
      regenerateTaskTimeouts(game);
    },
  },
})