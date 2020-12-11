import { UsernamePasswordInput } from "src/types"

export const validRegister = (options: UsernamePasswordInput) => {
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: `The length of username must be greater than two`,
      },
    ]
  }
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: `Username cannot include an invalid input`,
      },
    ]
  }
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: `Email is invalid. Please input a valid email`,
      },
    ]
  }
  if (options.password.length <= 4) {
    return [
      {
        field: "password",
        message: `The length of password must be greater than three`,
      },
    ]
  }
  return null
}
