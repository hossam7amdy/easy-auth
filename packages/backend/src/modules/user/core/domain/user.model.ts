import { randomUUID } from 'node:crypto'

interface UserCreateProps {
  email: string
  name: string
  password: string
}

interface UserProps extends UserCreateProps {
  id: string
  createdAt: Date
  updatedAt: Date
}

export class User {
  #password: string

  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    password: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.#password = password
  }

  static create(props: UserCreateProps): User {
    return new User(
      randomUUID(),
      props.email,
      props.name,
      props.password,
      new Date(),
      new Date(),
    )
  }

  static from(props: UserProps): User {
    return new User(
      props.id,
      props.email,
      props.name,
      props.password,
      props.createdAt,
      props.updatedAt,
    )
  }

  get password() {
    return this.#password
  }
}
