// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { RuneClient } from "rune-games-sdk/multiplayer";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export type TaskType = 1 | 2 | 3;

// function constTaskTypeBookPurchase(): TaskType { return 1 }

export const TASK_TYPE_BOOK_PURCHASE: TaskType = 1;
export const TASK_TYPE_BOOK_SORT_GENRE: TaskType = 2;
export const TASK_TYPE_BOOK_SORT_AUTHOR: TaskType = 3;


export type BookGenre = 0 | 1 | 2;

// function constBookGenreFantasy(): BookGenre { return 0 }
// function constBookGenrePoetry(): BookGenre { return 1 }
// function constBookGenreRomance(): BookGenre { return 2 }

const NUM_GENRES: number = 3;

export const GENRE_FANTASY: BookGenre = 0;
export const GENRE_POETRY: BookGenre = 1;
export const GENRE_ROMANCE: BookGenre = 2;

function allBookGenres(): Array<BookGenre> {
  return [GENRE_FANTASY, GENRE_POETRY, GENRE_ROMANCE];
}


// Gameplay Constants

// function constMaxPendingTasks(): number { return 10 }
// function constShelfCapacity(): number { return 12 }

// const DEFAULT_TASK_ID: number = 0;
const MAX_PENDING_TASKS: number = 10;
const SHELF_CAPACITY: number = 30;
const DEFAULT_BOOK_SORT_TIMER: number = 5;


// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------


function randomInt(): number { return Math.floor(Math.random() * 2147483647) }


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
// Player Tasks
// -----------------------------------------------------------------------------


export interface Task {
  id: number;
  type: TaskType;
  timeout: number;
  timer: number;
  handler: string | null;
}


export interface BookPurchase extends Task {
  amount: number;
}


function newBookPurchase(id: number, timeout: number, amount: number): BookPurchase {
  return {
    id,
    type: TASK_TYPE_BOOK_PURCHASE,
    timeout,
    timer: timeout,
    handler: null,
    amount,
  };
}


export interface SortByGenre extends Task {
  books: Array<BookGenre>;
}


function newSortBooksByGenre(id: number): SortByGenre {
  let r = randomInt();
  const books: BookGenre[] = [];
  for (let i = 0; i < 4; ++i) {
    const genre = (r % NUM_GENRES) as BookGenre;
    books.push(genre);
    r = r >> 1;
  }
  return {
    id,
    type: TASK_TYPE_BOOK_SORT_GENRE,
    timeout: DEFAULT_BOOK_SORT_TIMER,
    timer: 0,
    handler: null,
    books,
  };
}


export interface SortByAuthor extends Task {
  authors: Array<string>;
}


function newSortBooksByAuthor(id: number): SortByAuthor {
  let r = (Math.random() * 1000000) | 0;
  const authors = [];
  for (let i = 0; i < 4; ++i) {
    const author: string = String.fromCharCode(65 + (r % 26));
    authors.push(author);
    r = r >> 1;
  }
  return {
    id,
    type: TASK_TYPE_BOOK_SORT_AUTHOR,
    timeout: DEFAULT_BOOK_SORT_TIMER,
    timer: 0,
    handler: null,
    authors,
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
  books: number;
  sortingTasks: Array<SortByAuthor>;
}


function newBookShelf(genre: BookGenre): Bookshelf {
  return { genre, books: SHELF_CAPACITY, sortingTasks: [] };
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
  // General properties
  players: Record<string, PlayerState>;
  score: number;
  timer: number;
  generatedTasks: number;
  // generatedBooks: number;
  // Pending player tasks
  tasks: Array<Task>;
  lastTaskCreatedAt: number;
  // Books and bookshelves
  bookshelves: Array<Bookshelf>;
  lostZone: Array<SortByGenre>;  // books to put back on shelves
}


// function generateBook(game: GameState, genre?: BookGenre): Book {
//   const id: number = ++game.generatedBooks;
//   const r: number = Math.random();
//   const author: string = String.fromCharCode(65 + ((r * 26) | 0));
//   genre = genre != null ? genre : ((r * NUM_GENRES) | 0) as BookGenre;
//   return newBook(id, author, genre);
// }


function moveBooksFromShelvesToLostZone(game: GameState): void {
  const task = newSortBooksByGenre(++game.generatedTasks);
  game.lostZone.push(task);
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


function generateNewTasks(game: GameState): void {
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
  const amount = 3;
  addNewTask(game, newBookPurchase(id, timeout, amount));
  game.lastTaskCreatedAt = now;
  // const t = (r * 2) | 0;
  // switch (t) {
  //   case TASK_TYPE_BOOK_PURCHASE:
  //     return addNewTask(game, newBookPurchase(id, timeout, amount));
  // }
}


function processCompletedTask(game: GameState, playerId: string, task: Task): void {
  let points: number = 0;
  const player: PlayerState = game.players[playerId];
  switch (task.type) {
    case TASK_TYPE_BOOK_PURCHASE:
      points = 10 * (task as BookPurchase).amount;
      break;
  }
  game.score += points;
  player.score += points;
}


function processFailedTask(game: GameState, task: Task): void {
  switch (task.type) {
    case TASK_TYPE_BOOK_PURCHASE: {
      // all books the client was holding must now be put back on shelves
      const lostBooks = newSortBooksByGenre(++game.generatedTasks);
      game.lostZone.push(lostBooks);
      break;
    }
  }
}


function updateTimedTasks(game: GameState): void {
  const tasks = game.tasks;
  const n = tasks.length;
  for (let i = n-1; i >= 0; --i) {
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


function updateBookshelfTasks(game: GameState): void {
  // increase timers and generate new tasks for each that
  // goes over the timeout
  for (const shelf of game.bookshelves) {
    const n = shelf.sortingTasks.length;
    for (let i = n-1; i >= 0; --i) {
      const task = shelf.sortingTasks[i];
      if (task.timer >= task.timeout) { continue }
      task.timer++;
      if (task.timer >= task.timeout) {
        shelf.sortingTasks.push(newSortBooksByAuthor(++game.generatedTasks));
      }
    }
  }
}


function updateLostZoneTasks(game: GameState) {
  const n = game.lostZone.length;
  for (let i = n-1; i >= 0; --i) {
    const task = game.lostZone[i];
    if (task.timer >= task.timeout) { continue }
    task.timer++;
    if (task.timer >= task.timeout) {
      moveBooksFromShelvesToLostZone(game);
    }
  }
}


function updateTaskTimers(game: GameState): void {
  updateTimedTasks(game);
  updateBookshelfTasks(game);
  updateLostZoneTasks(game);
}


function onGameTick(game: GameState): void {
  game.timer--;
  updateTaskTimers(game);
  generateNewTasks(game);
}


function generateInitialData(game: GameState): void {
  // generate books and sorting tasks for the shelves
  for (const shelf of game.bookshelves) {
    shelf.books = SHELF_CAPACITY;
    shelf.sortingTasks.push(newSortBooksByAuthor(++game.generatedTasks));
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
    for (const task of shelf.sortingTasks) {
      task.timeout = t;
    }
  }
  // update lost zone
  for (const task of game.lostZone) {
    task.timeout = t;
  }
}


// -----------------------------------------------------------------------------
// Rune Steup
// -----------------------------------------------------------------------------


declare global {
  const Rune: RuneClient<GameState, GameActions>;
}


type GameActions = {
  completeTask: (params: { taskId: number }) => void;
  sortBookshelf: (params: { taskId: number, genre: BookGenre }) => void;
  sortLostZone: (params: { taskId: number, amount: number }) => void;
  completeBookPurchase: (params: { amount: number }) => void;
}


Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,

  setup: (allPlayerIds: Array<string>): GameState => {
    const game: GameState = {
      players: {},
      score: 0,
      timer: 300,
      generatedTasks: 0,
      // generatedBooks: 0,
      tasks: [],
      lastTaskCreatedAt: 0,
      bookshelves: allBookGenres().map(newBookShelf),
      lostZone: [],
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
    completeTask: ({ taskId }, { game, playerId }) => {
      const tasks = game.tasks;
      for (const i of tasks.keys()) {
        const task = tasks[i];
        if (task.id !== taskId) { continue }
        tasks.splice(i, 1);
        return processCompletedTask(game, playerId, task);
      }
      Rune.invalidAction();
    },

    sortBookshelf: ({ taskId, genre }, { game, playerId }) => {
      for (const shelf of game.bookshelves) {
        if (shelf.genre != genre) { continue }

        const tasks = shelf.sortingTasks;
        for (const i of tasks.keys()) {
          const task = tasks[i];
          if (task.id !== taskId) { continue }
          tasks.splice(i, 1);
          return processCompletedTask(game, playerId, task);
        }
        break;
      }
      Rune.invalidAction();
    },

    sortLostZone: ({ taskId, amount }, { game, playerId }) => {
      const tasks = game.lostZone;
      for (const i of tasks.keys()) {
        const task = tasks[i];
        if (task.id !== taskId) { continue }
        if (task.books.length < amount) { Rune.invalidAction(); }
        tasks.splice(i, 1);
        return processCompletedTask(game, playerId, task);
      }
      Rune.invalidAction();
    },

    completeBookPurchase: ({ amount }, { game, playerId }) => {
      const tasks = game.tasks;
      for (const i of tasks.keys()) {
        const task = tasks[i] as BookPurchase;
        if (task.amount > amount) { continue }
        tasks.splice(i, 1);
        return processCompletedTask(game, playerId, task);
      }
      Rune.invalidAction();
    },
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
