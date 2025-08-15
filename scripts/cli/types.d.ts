declare module 'comment-parser' {
  interface CommentBlock {
    tags: Array<{
      tag: string
      name: string
      type: string
      optional: boolean
      description: string
    }>
    description: string
    source: string
  }

  function parse(source: string, options?: any): CommentBlock[]

  export = parse
}