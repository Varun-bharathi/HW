declare module 'multer' {
  import type { Request } from 'express'

  export interface File {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    destination?: string
    filename?: string
    path?: string
  }

  interface StorageEngine {
    _handleFile(req: Request, file: File, cb: (e: Error | null, info?: Partial<File>) => void): void
    _removeFile(req: Request, file: File, cb: (e: Error | null) => void): void
  }

  interface DiskStorageOptions {
    destination?(req: Request, file: File, cb: (e: Error | null, d: string) => void): void
    filename?(req: Request, file: File, cb: (e: Error | null, n: string) => void): void
  }

  interface Options {
    dest?: string
    storage?: StorageEngine
    fileFilter?(
      req: Request,
      file: File,
      cb: (error: Error | null, acceptFile?: boolean) => void
    ): void
    limits?: { fileSize?: number }
  }

  interface MulterInstance {
    single(name: string): (req: Request, res: unknown, next: (err?: unknown) => void) => void
  }

  function multer(options?: Options): MulterInstance
  namespace multer {
    function diskStorage(opts: DiskStorageOptions): StorageEngine
  }

  export = multer
}
