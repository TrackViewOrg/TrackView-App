import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Polyfill Request/Response for Next.js 13+ App Router tests
if (typeof global.Request === 'undefined') {
    global.Request = class Request {
        url: string
        headers: Headers
        method: string
        body: any

        constructor(input: string | { url: string }, init?: any) {
            this.url = typeof input === 'string' ? input : input.url
            this.headers = new Headers(init?.headers)
            this.method = init?.method || 'GET'
            this.body = init?.body
        }
    } as any
}

if (typeof global.Response === 'undefined') {
    global.Response = class Response {
        headers: Headers
        status: number
        statusText: string

        constructor(body?: any, init?: any) {
            this.headers = new Headers(init?.headers)
            this.status = init?.status || 200
            this.statusText = init?.statusText || 'OK'
        }
    } as any
}

if (typeof global.Headers === 'undefined') {
    global.Headers = class Headers extends Map {
        append(name: string, value: string) {
            this.set(name, value)
        }
    } as any
}