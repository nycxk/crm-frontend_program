import { get } from '@/utils/request'

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  company: {
    name: string
    catchPhrase: string
    bs: string
  }
  address: {
    street: string
    suite: string
    city: string
    zipcode: string
  }
}

export function getUserById(id: number): Promise<User> {
  return get<User>(`https://jsonplaceholder.typicode.com/users/${id}`)
}
