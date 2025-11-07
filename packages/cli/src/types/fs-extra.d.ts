declare module "fs-extra" {
  import type { Stats, PathLike } from "node:fs";

  export interface CopyOptions {
    overwrite?: boolean;
    errorOnExist?: boolean;
    dereference?: boolean;
    preserveTimestamps?: boolean;
    filter?: (src: string, dest: string) => boolean | Promise<boolean>;
  }

  export interface MoveOptions {
    overwrite?: boolean;
  }

  export interface WriteOptions {
    encoding?: BufferEncoding;
    mode?: number;
    flag?: string;
  }

  export interface ReadOptions {
    encoding?: BufferEncoding;
    flag?: string;
  }

  // File operations
  export function access(path: PathLike, mode?: number): Promise<void>;
  export function copy(
    src: string,
    dest: string,
    options?: CopyOptions
  ): Promise<void>;
  export function emptyDir(dir: string): Promise<void>;
  export function ensureDir(dir: string): Promise<void>;
  export function ensureFile(file: string): Promise<void>;
  export function move(
    src: string,
    dest: string,
    options?: MoveOptions
  ): Promise<void>;
  export function outputFile(
    file: string,
    data: string | Buffer,
    options?: WriteOptions
  ): Promise<void>;
  export function pathExists(path: string): Promise<boolean>;
  export function readdir(
    path: PathLike,
    options?: ReadOptions
  ): Promise<string[]>;
  export function readFile(
    path: PathLike,
    options?: ReadOptions | BufferEncoding
  ): Promise<string>;
  export function readFile(path: PathLike): Promise<Buffer>;
  export function readJson<T = unknown>(
    file: string,
    options?: ReadOptions
  ): Promise<T>;
  export function remove(dir: string): Promise<void>;
  export function stat(path: PathLike): Promise<Stats>;
  export function writeFile(
    file: string,
    data: string | Buffer,
    options?: WriteOptions | BufferEncoding
  ): Promise<void>;
  export function writeJson(
    file: string,
    object: unknown,
    options?: WriteOptions & { spaces?: number | string }
  ): Promise<void>;

  // Re-export everything from fs for compatibility
  export * from "node:fs";
}
