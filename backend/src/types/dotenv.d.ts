declare module 'dotenv' {
  export function config(options?: {
    path?: string;
    encoding?: string;
    debug?: boolean;
  }): { parsed?: { [key: string]: string } };
  
  export function parse(src: string): { [key: string]: string };
}