// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { RuneClient } from "rune-games-sdk/multiplayer";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export type TaskType = 0 | 1 | 2 | 3;

// function constTaskTypeBookPurchase(): TaskType { return 1 }

export const TASK_TYPE_NONE: TaskType = 0;
export const TASK_TYPE_BOOK_PURCHASE: TaskType = 1;
export const TASK_TYPE_BOOK_SORT_GENRE: TaskType = 2;
export const TASK_TYPE_BOOK_SORT_AUTHOR: TaskType = 3;


export type BookGenre = 0 | 1 | 2;

// function constBookGenreFantasy(): BookGenre { return 0 }
// function constBookGenrePoetry(): BookGenre { return 1 }
// function constBookGenreRomance(): BookGenre { return 2 }

// const NUM_GENRES: number = 3;

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
const MAX_32BIT_INT = 2147483647;

export const NUM_BOOKS_PER_PURCHASE: number = 3;
export const GAME_TIME_SECONDS: number = 300;


// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------


function randomInt(seed: number = 0, limit: number = MAX_32BIT_INT) {
  // let t = seed += 0x6D2B79F5;
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  t = ((t ^ t >>> 14) >>> 0) / 4294967296;
  return Math.floor(t * limit);
}


function newArrayOfLetters(seed: number): Array<string> {
  const authors: Set<string> = new Set();
  for (let i = 0; i < 4; ++i) {
    const r = randomInt(seed + i, 26);
    let k = 0;
    let author: string = String.fromCharCode(65 + r);
    for (; k < 26; ++k) {
      if (!authors.has(author)) { break }
      author = String.fromCharCode(65 + ((r + k) % 26));
    }
    authors.add(author);
  }
  return Array.from(authors);
}


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
  createdAt: number;
  endsAt: number;
}


function newBookPurchase(id: number, createdAt: number, endsAt: number): Task {
  return {
    id,
    type: TASK_TYPE_BOOK_PURCHASE,
    createdAt,
    endsAt,
  };
}


function newSortBooksByAuthor(id: number, createdAt: number, endsAt: number): Task {
  return {
    id,
    type: TASK_TYPE_BOOK_SORT_AUTHOR,
    createdAt,
    endsAt,
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
  sorting: Array<string>;  // authors
}


function newBookShelf(genre: BookGenre, seed: number): Bookshelf {
  return { genre, books: SHELF_CAPACITY, sorting: newArrayOfLetters(genre + seed) };
}


// -----------------------------------------------------------------------------
// Game State
// -----------------------------------------------------------------------------


export interface GameState {
  // General properties
  players: Record<string, PlayerState>;
  score: number;
  timer: number;
  generatedTasks: number;
  seed: number;
  // Pending player tasks
  tasks: Array<Task>;
  lastTaskCreatedAt: number;
  // Books and bookshelves
  bookshelves: Array<Bookshelf>;
}


function disorganizeShelves(game: GameState): void {
  // prevent overflowing the game with tasks
  if (game.tasks.length > MAX_PENDING_TASKS) { return }

  // use randomness to determine whether a new task will be generated
  // use number of players and game.lastTaskCreatedAt to influence decision
  game.seed = randomInt(game.seed);
  const numPlayers = Object.keys(game.players).length;
  const now = Rune.gameTimeInSeconds();

  // use randomness to determine task type
  // use sorted insertion based on remaining time
  game.lastTaskCreatedAt = now;
  const id = ++game.generatedTasks;
  const timeout = 12 - numPlayers + 1;

  addNewTask(game, newSortBooksByAuthor(id, now, now + timeout));
}


function addNewTask(game: GameState, task: Task): void {
  // sorted insertion of new task
  const t = task.endsAt;
  const tasks = game.tasks;
  const n = tasks.length;
  // perform small optimizations to avoid splice
  if (n === 0) {
    tasks.push(task);
  } else {
    if (tasks[n-1].endsAt <= t) {
      // the new task is the last to expire
      tasks.push(task);
    } else if (tasks[0].endsAt > t) {
      // the new task is the first to expire
      tasks.unshift(task);
    } else {
      for (let i = tasks.length - 2; i >= 0; --i) {
        if (tasks[i].endsAt <= t) {
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
  game.seed = randomInt(game.seed);
  const numPlayers = Object.keys(game.players).length;
  const now = Rune.gameTimeInSeconds();
  const reliefPeriod = (now - game.lastTaskCreatedAt) | 0;
  const chance = 20 * numPlayers * reliefPeriod;
  const r = randomInt(game.seed, 100);
  if (r >= chance) { return }

  // use randomness to determine task type
  // use sorted insertion based on remaining time
  game.lastTaskCreatedAt = now;
  const id = ++game.generatedTasks;
  const timeout = 12 - numPlayers + 1;
  const endsAt = now + timeout;

  if (r < 60) {
    addNewTask(game, newBookPurchase(id, now, endsAt));
  } else {
    addNewTask(game, newSortBooksByAuthor(id, now, endsAt));
  }
}


function processCompletedTask(game: GameState, playerId: string, task: Task): void {
  let points: number = 0;
  const player: PlayerState = game.players[playerId];
  switch (task.type) {
    case TASK_TYPE_BOOK_PURCHASE:
      points = NUM_BOOKS_PER_PURCHASE;
      break;
    case TASK_TYPE_BOOK_SORT_AUTHOR:
      // variable points based on timer causes state desync
      // points = 10 - Math.min(8, Math.floor(task.timeout - task.timer));
      points = 10;
      break;
  }
  game.score += points;
  player.score += points;
}


function processFailedTask(game: GameState, task: Task): void {
  // simply generate more sorting tasks
  if (task.type === TASK_TYPE_BOOK_PURCHASE) {
    disorganizeShelves(game);
  }
}


function updateTimedTasks(game: GameState): void {
  const now = Rune.gameTimeInSeconds();
  const tasks = game.tasks;
  const n = tasks.length;
  for (let i = n-1; i >= 0; --i) {
    if (tasks[i].endsAt < now) {
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


function updateTaskTimers(game: GameState): void {
  updateTimedTasks(game);
  // updateBookshelfTasks(game);
  // updateLostZoneTasks(game);
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
  }
  for (const _k of Object.keys(game.players)) {
    disorganizeShelves(game);
  }
}


// -----------------------------------------------------------------------------
// Rune Steup
// -----------------------------------------------------------------------------


declare global {
  const Rune: RuneClient<GameState, GameActions>;
}


type GameActions = {
  sortBookshelf: (params: { genre: BookGenre, sorted: Array<string> }) => void;
  completeBookPurchase: (params: { amount: number }) => void;
}


Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,

  setup: (allPlayerIds: Array<string>): GameState => {
    const seed = Math.floor(Math.random() * MAX_32BIT_INT);
    const game: GameState = {
      players: {},
      score: 0,
      timer: GAME_TIME_SECONDS,
      generatedTasks: 0,
      seed,
      tasks: [],
      lastTaskCreatedAt: 0,
      bookshelves: allBookGenres().map(g => newBookShelf(g, seed)),
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
    sortBookshelf: ({ genre, sorted }, { game, playerId }) => {
      for (const shelf of game.bookshelves) {
        if (shelf.genre != genre) { continue }

        const tasks = game.tasks;
        for (const i of tasks.keys()) {
          const task = game.tasks[i];
          if (task.type !== TASK_TYPE_BOOK_SORT_AUTHOR) { continue }

          const authors = shelf.sorting;
          const expected = authors.slice().sort();
          if (expected.toString() !== sorted.toString()) { break }

          tasks.splice(i, 1);
          game.seed = randomInt(game.seed);
          shelf.sorting = newArrayOfLetters(game.seed);
          return processCompletedTask(game, playerId, task);
        }
        break;
      }
      Rune.invalidAction();
    },

    completeBookPurchase: ({ amount }, { game, playerId }) => {
      const tasks = game.tasks;
      for (const i of tasks.keys()) {
        if (tasks[i].type !== TASK_TYPE_BOOK_PURCHASE) { continue }

        const task = tasks[i];
        if (amount < NUM_BOOKS_PER_PURCHASE) { continue }
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
      // regenerateTaskTimeouts(game);
    },

    playerLeft(playerId, { game }) {
      delete (game as GameState).players[playerId];
      // update task timers based on number of players
      // regenerateTaskTimeouts(game);
    },
  },
})
